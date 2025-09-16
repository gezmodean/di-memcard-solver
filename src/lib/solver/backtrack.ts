import type { Piece, PlacedPiece, Solution, RarityConfig, Rarity } from '../types';
import { canPlacePiece, placePieceOnGrid } from './validation';
import { rotateShape } from '../utils/rotation';
import { calculatePieceStats } from '../pieces/definitions';

interface SolverOptions {
  maxSolutions?: number;
  timeoutMs?: number;
  onProgress?: (progress: { placedCount: number; totalPieces: number }) => void;
  rarityConfigs?: Record<Rarity, RarityConfig>;
}

export class GridSolver {
  private startTime: number = 0;
  private solutionCount: number = 0;
  private maxSolutions: number;
  private timeoutMs: number;
  private onProgress?: (progress: { placedCount: number; totalPieces: number }) => void;
  private rarityConfigs?: Record<Rarity, RarityConfig>;

  constructor(options: SolverOptions = {}) {
    this.maxSolutions = options.maxSolutions || 10;
    this.timeoutMs = options.timeoutMs || 30000; // 30 seconds
    this.onProgress = options.onProgress;
    this.rarityConfigs = options.rarityConfigs;
  }

  solve(pieces: Piece[], selectedPieceIds: string[]): Solution[] {
    this.startTime = Date.now();
    this.solutionCount = 0;

    const selectedPieces = pieces.filter(p =>
      selectedPieceIds.includes(p.id) && p.unlocked
    );

    if (selectedPieces.length === 0) {
      return [];
    }

    const solutions: Solution[] = [];
    const grid: (string | null)[][] = Array(9).fill(null).map(() => Array(9).fill(null));
    const placedPieces: PlacedPiece[] = [];

    this.backtrack(
      grid,
      selectedPieces,
      0,
      placedPieces,
      solutions
    );

    return solutions;
  }

  private backtrack(
    grid: (string | null)[][],
    pieces: Piece[],
    pieceIndex: number,
    placedPieces: PlacedPiece[],
    solutions: Solution[]
  ): boolean {
    // Check timeout
    if (Date.now() - this.startTime > this.timeoutMs) {
      return false;
    }

    // Check if we've found enough solutions
    if (this.solutionCount >= this.maxSolutions) {
      return false;
    }

    // Report progress
    if (this.onProgress) {
      this.onProgress({ placedCount: placedPieces.length, totalPieces: pieces.length });
    }

    // Base case: all pieces placed
    if (pieceIndex >= pieces.length) {
      const solution = this.createSolution(placedPieces, pieces);
      solutions.push(solution);
      this.solutionCount++;
      return true;
    }

    const currentPiece = pieces[pieceIndex];

    // Try all possible positions and rotations for the current piece
    for (let rotation = 0; rotation < 360; rotation += 90) {
      const rotatedShape = rotateShape(currentPiece.shape, rotation);

      for (let y = 0; y < 9; y++) {
        for (let x = 0; x < 9; x++) {
          if (canPlacePiece(grid, currentPiece.shape, x, y, rotation)) {
            // Place the piece
            const newGrid = placePieceOnGrid(grid, currentPiece.id, rotatedShape, x, y);
            const newPlacedPiece: PlacedPiece = {
              pieceId: currentPiece.id,
              x,
              y,
              rotation,
              shape: rotatedShape
            };

            // Recurse to next piece
            if (this.backtrack(
              newGrid,
              pieces,
              pieceIndex + 1,
              [...placedPieces, newPlacedPiece],
              solutions
            )) {
              // Continue searching for more solutions
              if (this.solutionCount >= this.maxSolutions) {
                return true;
              }
            }
          }
        }
      }
    }

    // If we can't place this piece anywhere, this path failed
    return false;
  }

  private createSolution(placedPieces: PlacedPiece[], allPieces: Piece[]): Solution {
    let totalAtk = 0;
    let totalHp = 0;

    placedPieces.forEach(placed => {
      const piece = allPieces.find(p => p.id === placed.pieceId);
      if (piece) {
        const stats = calculatePieceStats(piece, this.rarityConfigs);
        totalAtk += stats.atk;
        totalHp += stats.hp;
      }
    });

    return {
      id: `solution_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      pieces: placedPieces,
      totalStats: { atk: totalAtk, hp: totalHp },
      timestamp: Date.now()
    };
  }
}

export function findOptimalConfiguration(
  pieces: Piece[],
  selectedPieceIds: string[],
  optimizeFor: 'atk' | 'hp' | 'balanced' = 'balanced'
): Solution | null {
  const solver = new GridSolver({ maxSolutions: 50 });
  const solutions = solver.solve(pieces, selectedPieceIds);

  if (solutions.length === 0) return null;

  return solutions.reduce((best, current) => {
    const bestScore = getScore(best, optimizeFor);
    const currentScore = getScore(current, optimizeFor);
    return currentScore > bestScore ? current : best;
  });
}

function getScore(solution: Solution, optimizeFor: 'atk' | 'hp' | 'balanced'): number {
  const { atk, hp } = solution.totalStats;

  switch (optimizeFor) {
    case 'atk': return atk;
    case 'hp': return hp;
    case 'balanced': return atk + hp;
    default: return atk + hp;
  }
}