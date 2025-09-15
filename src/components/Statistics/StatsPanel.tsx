import React, { useState, useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';
import { loadStatistics, exportStatistics, clearStatistics } from '../../lib/utils/stats';
import type { Statistics } from '../../lib/types';

export const StatsPanel: React.FC = () => {
  const { placedPieces, conflicts, getTotalStats, clearGrid, pieces } = useGameStore();
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [showDetailed, setShowDetailed] = useState(false);

  useEffect(() => {
    setStatistics(loadStatistics());
  }, []);

  const stats = getTotalStats();
  const totalPieces = placedPieces.size;
  const conflictCount = conflicts.size;
  const validPieces = totalPieces - conflictCount;

  const handleClearStats = () => {
    if (confirm('Are you sure you want to clear all statistics?')) {
      clearStatistics();
      setStatistics(loadStatistics());
    }
  };

  const getMostUsedPieces = () => {
    if (!statistics || !statistics.pieceUsage) return [];

    return Object.entries(statistics.pieceUsage)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([pieceId, count]) => {
        const piece = pieces.find(p => p.id === pieceId);
        return { piece, count };
      })
      .filter(item => item.piece);
  };

  return (
    <div className="bg-gray-950 border border-gray-700 p-3 rounded" style={{ backgroundColor: '#0a0a0f' }}>
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-bold text-white">Current Configuration</h3>
        <div className="flex items-center gap-2">
          <div className="text-sm text-gray-300">
            {totalPieces}/9 pieces
          </div>
          <button
            onClick={() => setShowDetailed(!showDetailed)}
            className="text-xs text-gray-400 hover:text-white"
          >
            {showDetailed ? '▲' : '▼'}
          </button>
        </div>
      </div>

      {/* Primary Stats - Always Visible */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="text-center bg-red-500/10 border border-red-500/30 rounded p-3">
          <div className="text-2xl font-bold text-red-400">{stats.atk}</div>
          <div className="text-sm text-gray-400 font-medium">Total ATK</div>
        </div>
        <div className="text-center bg-green-500/10 border border-green-500/30 rounded p-3">
          <div className="text-2xl font-bold text-green-400">{stats.hp}</div>
          <div className="text-sm text-gray-400 font-medium">Total HP</div>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="text-center bg-blue-500/10 border border-blue-500/30 rounded p-2">
          <div className="text-lg font-bold text-blue-400">{validPieces}</div>
          <div className="text-xs text-gray-400 font-medium">Valid Pieces</div>
        </div>
        <div className="text-center bg-purple-500/10 border border-purple-500/30 rounded p-2">
          <div className="text-lg font-bold text-purple-400">{stats.atk + stats.hp}</div>
          <div className="text-xs text-gray-400 font-medium">Combined</div>
        </div>
        <div className="text-center bg-yellow-500/10 border border-yellow-500/30 rounded p-2">
          <div className="text-lg font-bold text-yellow-400">{conflictCount}</div>
          <div className="text-xs text-gray-400 font-medium">Conflicts</div>
        </div>
      </div>

      {showDetailed && statistics && (
        <div className="mb-4 p-3 bg-gray-900/50 border border-gray-700/50 rounded">
          <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
            <div>Total Solutions: {statistics.totalSolutions}</div>
            <div>Avg Solve Time: {Math.round(statistics.averageSolveTime)}ms</div>
            <div>Best ATK: {statistics.bestConfiguration.atk}</div>
            <div>Best HP: {statistics.bestConfiguration.hp}</div>
          </div>

          {getMostUsedPieces().length > 0 && (
            <div>
              <div className="text-sm font-medium mb-2">Most Used Pieces:</div>
              <div className="text-xs space-y-1">
                {getMostUsedPieces().map(({ piece, count }) => (
                  <div key={piece!.id} className="flex justify-between">
                    <span>{piece!.icon} {piece!.name}</span>
                    <span>{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Actions and Status */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          {showDetailed && (
            <>
              <button
                onClick={exportStatistics}
                className="px-2 py-1 bg-green-600/80 hover:bg-green-600 border border-green-500/50 hover:border-green-400 rounded text-xs transition-all duration-200 font-medium text-white"
              >
                Export Stats
              </button>
              <button
                onClick={handleClearStats}
                className="px-2 py-1 bg-yellow-600/80 hover:bg-yellow-600 border border-yellow-500/50 hover:border-yellow-400 rounded text-xs transition-all duration-200 font-medium text-white"
              >
                Clear History
              </button>
            </>
          )}
        </div>
        <button
          onClick={clearGrid}
          className="px-3 py-1 bg-red-600/80 hover:bg-red-600 border border-red-500/50 hover:border-red-400 rounded text-sm transition-all duration-200 font-medium text-white"
        >
          Clear Grid
        </button>
      </div>

      {conflictCount > 0 && (
        <div className="mt-3 p-2 bg-red-500/10 border border-red-500/30 rounded text-center">
          <div className="text-sm text-red-400 font-medium">
            ⚠️ {conflictCount} piece{conflictCount > 1 ? 's have' : ' has'} conflicts
          </div>
          <div className="text-xs text-red-300 mt-1">
            Conflicted pieces don't contribute to stats
          </div>
        </div>
      )}
    </div>
  );
};