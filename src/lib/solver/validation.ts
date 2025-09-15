import { rotateShape } from '../utils/rotation';

export function canPlacePiece(
  grid: (string | null)[][],
  pieceShape: number[][],
  x: number,
  y: number,
  rotation: number,
  excludePieceId?: string
): boolean {
  const rotatedShape = rotateShape(pieceShape, rotation);

  for (let i = 0; i < rotatedShape.length; i++) {
    for (let j = 0; j < rotatedShape[i].length; j++) {
      if (rotatedShape[i][j] === 1) {
        const gridX = x + j;
        const gridY = y + i;

        // Check bounds
        if (gridX < 0 || gridX >= 9 || gridY < 0 || gridY >= 9) {
          return false;
        }

        // Check if cell is occupied by another piece
        const cellValue = grid[gridY][gridX];
        if (cellValue !== null && cellValue !== excludePieceId) {
          return false;
        }
      }
    }
  }

  return true;
}

export function getAllValidPositions(
  grid: (string | null)[][],
  pieceShape: number[][],
  excludePieceId?: string
): Array<{ x: number; y: number; rotation: number }> {
  const positions: Array<{ x: number; y: number; rotation: number }> = [];

  for (let rotation = 0; rotation < 360; rotation += 90) {
    for (let y = 0; y < 9; y++) {
      for (let x = 0; x < 9; x++) {
        if (canPlacePiece(grid, pieceShape, x, y, rotation, excludePieceId)) {
          positions.push({ x, y, rotation });
        }
      }
    }
  }

  return positions;
}

export function placePieceOnGrid(
  grid: (string | null)[][],
  pieceId: string,
  shape: number[][],
  x: number,
  y: number
): (string | null)[][] {
  const newGrid = grid.map(row => [...row]);

  for (let i = 0; i < shape.length; i++) {
    for (let j = 0; j < shape[i].length; j++) {
      if (shape[i][j] === 1) {
        newGrid[y + i][x + j] = pieceId;
      }
    }
  }

  return newGrid;
}

export function removePieceFromGrid(
  grid: (string | null)[][],
  pieceId: string
): (string | null)[][] {
  return grid.map(row =>
    row.map(cell => cell === pieceId ? null : cell)
  );
}