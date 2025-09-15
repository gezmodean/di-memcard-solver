import type { Statistics, Solution } from '../types';

const STATS_STORAGE_KEY = 'memsolver-statistics';

export function loadStatistics(): Statistics {
  try {
    const stored = localStorage.getItem(STATS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading statistics:', error);
  }

  return {
    totalSolutions: 0,
    pieceUsage: {},
    averageSolveTime: 0,
    bestConfiguration: {
      atk: 0,
      hp: 0,
      pieces: []
    }
  };
}

export function saveStatistics(stats: Statistics): void {
  try {
    localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));
  } catch (error) {
    console.error('Error saving statistics:', error);
  }
}

export function updateStatistics(
  solution: Solution,
  solveTimeMs: number,
  currentStats?: Statistics
): Statistics {
  const stats = currentStats || loadStatistics();

  // Update solution count
  stats.totalSolutions += 1;

  // Update piece usage
  solution.pieces.forEach(piece => {
    stats.pieceUsage[piece.pieceId] = (stats.pieceUsage[piece.pieceId] || 0) + 1;
  });

  // Update average solve time
  const previousTotalTime = stats.averageSolveTime * (stats.totalSolutions - 1);
  stats.averageSolveTime = (previousTotalTime + solveTimeMs) / stats.totalSolutions;

  // Update best configuration
  const totalScore = solution.totalStats.atk + solution.totalStats.hp;
  const bestScore = stats.bestConfiguration.atk + stats.bestConfiguration.hp;

  if (totalScore > bestScore) {
    stats.bestConfiguration = {
      atk: solution.totalStats.atk,
      hp: solution.totalStats.hp,
      pieces: solution.pieces.map(p => p.pieceId)
    };
  }

  saveStatistics(stats);
  return stats;
}

export function exportStatistics(): void {
  const stats = loadStatistics();
  const blob = new Blob([JSON.stringify(stats, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `memsolver-stats-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function clearStatistics(): void {
  localStorage.removeItem(STATS_STORAGE_KEY);
}