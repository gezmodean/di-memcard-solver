import type { PlacedPiece } from '../types';

const API_BASE = import.meta.env.VITE_CACHE_API_URL || 'https://darkstar.build';

function getCacheKey(pieceIds: string[]): string {
  return [...pieceIds].sort().join(',');
}

export async function fetchCachedSolution(pieceIds: string[]): Promise<PlacedPiece[] | null> {
  try {
    const key = getCacheKey(pieceIds);
    const resp = await fetch(`${API_BASE}/api/solver/cache?pieces=${encodeURIComponent(key)}`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!resp.ok) return null;
    const data = await resp.json();
    return data.solution as PlacedPiece[];
  } catch {
    return null;
  }
}

export async function storeSolution(pieceIds: string[], solution: PlacedPiece[]): Promise<void> {
  try {
    await fetch(`${API_BASE}/api/solver/cache`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pieces: pieceIds, solution }),
      signal: AbortSignal.timeout(5000),
    });
  } catch {
    // Fire-and-forget — ignore errors
  }
}
