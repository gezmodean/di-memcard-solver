/**
 * Pre-warm the solver cache by solving common piece combinations
 * and POSTing results to the cache API.
 *
 * Usage: npx tsx scripts/prewarm-cache.ts [--api-url https://darkstar.build]
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Inline a minimal solver — we can't import the Vite-based src directly in Node
// so we re-use the same algorithm.

interface PieceDef {
  id: string;
  name: string;
  rarity: string;
  shape: number[][];
}

interface PlacedPiece {
  pieceId: string;
  x: number;
  y: number;
  rotation: number;
  shape: number[][];
}

function rotateShape(shape: number[][], degrees: number): number[][] {
  let result = shape;
  for (let i = 0; i < degrees / 90; i++) {
    const rows = result.length;
    const cols = result[0].length;
    const rotated: number[][] = Array(cols).fill(null).map(() => Array(rows).fill(0));
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        rotated[c][rows - 1 - r] = result[r][c];
      }
    }
    result = rotated;
  }
  return result;
}

function getUniqueRotations(shape: number[][]): number[] {
  const seen = new Set<string>();
  const unique: number[] = [];
  for (const deg of [0, 90, 180, 270]) {
    const key = JSON.stringify(rotateShape(shape, deg));
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(deg);
    }
  }
  return unique;
}

function cellCount(shape: number[][]): number {
  let c = 0;
  for (const row of shape) for (const v of row) if (v === 1) c++;
  return c;
}

function canPlace(grid: (string | null)[][], shape: number[][], x: number, y: number): boolean {
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c] !== 1) continue;
      const gy = y + r, gx = x + c;
      if (gy < 0 || gy >= 9 || gx < 0 || gx >= 9 || grid[gy][gx] !== null) return false;
    }
  }
  return true;
}

function placeOnGrid(grid: (string | null)[][], id: string, shape: number[][], x: number, y: number): (string | null)[][] {
  const newGrid = grid.map(row => [...row]);
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c] === 1) newGrid[y + r][x + c] = id;
    }
  }
  return newGrid;
}

function solve(pieces: PieceDef[], timeoutMs = 30000): PlacedPiece[] | null {
  const sorted = [...pieces].sort((a, b) => cellCount(b.shape) - cellCount(a.shape));
  const start = Date.now();

  function backtrack(grid: (string | null)[][], idx: number, placed: PlacedPiece[]): PlacedPiece[] | null {
    if (Date.now() - start > timeoutMs) return null;
    if (idx >= sorted.length) return placed;

    const piece = sorted[idx];
    const rotations = getUniqueRotations(piece.shape);

    for (const rot of rotations) {
      const shape = rotateShape(piece.shape, rot);
      for (let y = 0; y < 9; y++) {
        for (let x = 0; x < 9; x++) {
          if (canPlace(grid, shape, x, y)) {
            const newGrid = placeOnGrid(grid, piece.id, shape, x, y);
            const result = backtrack(newGrid, idx + 1, [...placed, { pieceId: piece.id, x, y, rotation: rot, shape }]);
            if (result) return result;
          }
        }
      }
    }
    return null;
  }

  const emptyGrid: (string | null)[][] = Array(9).fill(null).map(() => Array(9).fill(null));
  return backtrack(emptyGrid, 0, []);
}

/** Generate all k-combinations from arr. */
function* combinations<T>(arr: T[], k: number): Generator<T[]> {
  if (k === 0) { yield []; return; }
  for (let i = 0; i <= arr.length - k; i++) {
    for (const rest of combinations(arr.slice(i + 1), k - 1)) {
      yield [arr[i], ...rest];
    }
  }
}

async function main() {
  const args = process.argv.slice(2);
  let apiUrl = 'https://darkstar.build';
  const urlIdx = args.indexOf('--api-url');
  if (urlIdx !== -1 && args[urlIdx + 1]) {
    apiUrl = args[urlIdx + 1];
  }

  const piecesPath = resolve(__dirname, '..', 'public', 'pieces.json');
  const data = JSON.parse(readFileSync(piecesPath, 'utf-8'));
  const allPieces: PieceDef[] = data.pieces;

  // Target rarities for pre-warming (highest value cards)
  const targetRarities = ['transcendent', 'mythic', 'legendary', 'epic'];
  const targetPieces = allPieces.filter(p => targetRarities.includes(p.rarity));

  console.log(`Loaded ${allPieces.length} pieces, ${targetPieces.length} target pieces`);
  console.log(`API: ${apiUrl}`);

  // Generate 7-card combos (matching 9x9 grid capacity for high-rarity cards)
  // Total cells for 7 high-rarity cards: ~60-77 cells fits the 81-cell grid
  const comboSizes = [7, 8];
  let solved = 0, failed = 0, skippedCells = 0, cached = 0, total = 0;

  for (const size of comboSizes) {
    if (targetPieces.length < size) continue;
    const totalCells = 81;

    for (const combo of combinations(targetPieces, size)) {
      const cells = combo.reduce((s, p) => s + cellCount(p.shape), 0);
      // Skip combos that can't possibly fit (too many cells)
      if (cells > totalCells) { skippedCells++; continue; }

      total++;
      const ids = combo.map(p => p.id);
      const label = combo.map(p => p.name).join(', ');

      process.stdout.write(`[${total}] ${ids.join(',')} (${cells} cells) ... `);

      // Check if already cached
      try {
        const checkResp = await fetch(`${apiUrl}/api/solver/cache?pieces=${encodeURIComponent(ids.sort().join(','))}`);
        if (checkResp.ok) {
          cached++;
          console.log('CACHED (skipped)');
          continue;
        }
      } catch {
        // Cache check failed, solve anyway
      }

      const t0 = Date.now();
      const result = solve(combo, 30000);
      const elapsed = Date.now() - t0;

      if (result) {
        solved++;
        console.log(`SOLVED in ${elapsed}ms`);

        // Small delay to avoid overwhelming the API
        await new Promise(r => setTimeout(r, 200));

        // POST to cache API
        try {
          const resp = await fetch(`${apiUrl}/api/solver/cache`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pieces: ids, solution: result }),
          });
          if (!resp.ok) {
            console.log(`  WARNING: cache POST returned ${resp.status}`);
          }
        } catch (e) {
          console.log(`  WARNING: cache POST failed: ${e}`);
        }
      } else {
        failed++;
        console.log(`NO SOLUTION (${elapsed}ms)`);
      }
    }
  }

  console.log(`\nDone! Solved: ${solved}, No solution: ${failed}, Already cached: ${cached}, Skipped (too many cells): ${skippedCells}`);
}

main().catch(console.error);
