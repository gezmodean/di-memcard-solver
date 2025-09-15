import React, { useState } from 'react';
import type { Solution } from '../../lib/types';
import { useGameStore } from '../../store/gameStore';
import { GridSolver, findOptimalConfiguration } from '../../lib/solver/backtrack';
import { updateStatistics } from '../../lib/utils/stats';

export const SolutionViewer: React.FC = () => {
  const { pieces, clearGrid, placePiece } = useGameStore();
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [currentSolutionIndex, setCurrentSolutionIndex] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [searchProgress, setSearchProgress] = useState<{ placedCount: number; totalPieces: number } | null>(null);

  const unlockedPieces = pieces.filter(p => p.unlocked);

  const handleFindSolutions = async () => {
    setIsSearching(true);
    setSearchProgress(null);
    setSolutions([]);

    const startTime = Date.now();

    try {
      const solver = new GridSolver({
        maxSolutions: 5,
        timeoutMs: 10000,
        onProgress: setSearchProgress
      });

      // Use a subset of pieces for faster solving
      const selectedIds = unlockedPieces.slice(0, 8).map(p => p.id);
      const foundSolutions = solver.solve(pieces, selectedIds);

      const solveTime = Date.now() - startTime;

      // Update statistics for each solution found
      foundSolutions.forEach(solution => {
        updateStatistics(solution, solveTime);
      });

      setSolutions(foundSolutions);
      setCurrentSolutionIndex(0);
    } catch (error) {
      console.error('Error finding solutions:', error);
    } finally {
      setIsSearching(false);
      setSearchProgress(null);
    }
  };

  const handleFindOptimal = async () => {
    setIsSearching(true);

    try {
      const selectedIds = unlockedPieces.slice(0, 6).map(p => p.id);
      const optimal = findOptimalConfiguration(pieces, selectedIds, 'balanced');

      if (optimal) {
        setSolutions([optimal]);
        setCurrentSolutionIndex(0);
      }
    } catch (error) {
      console.error('Error finding optimal solution:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const applySolution = (solution: Solution) => {
    clearGrid();

    setTimeout(() => {
      solution.pieces.forEach(piece => {
        placePiece(piece.pieceId, piece.x, piece.y, piece.rotation);
      });
    }, 100);
  };

  const currentSolution = solutions[currentSolutionIndex];

  return (
    <div className="bg-gray-900 p-4 rounded-lg shadow-lg">
      <h3 className="text-lg font-bold mb-3">Solver</h3>

      <div className="flex gap-2 mb-4">
        <button
          onClick={handleFindSolutions}
          disabled={isSearching}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded transition-colors"
        >
          {isSearching ? 'Searching...' : 'Find Solutions'}
        </button>

        <button
          onClick={handleFindOptimal}
          disabled={isSearching}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 rounded transition-colors"
        >
          Find Optimal
        </button>
      </div>

      {isSearching && searchProgress && (
        <div className="mb-4 text-sm text-gray-300">
          Progress: {searchProgress.placedCount}/{searchProgress.totalPieces} pieces
        </div>
      )}

      {solutions.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm">Solution {currentSolutionIndex + 1} of {solutions.length}</span>
            <div className="flex gap-1">
              <button
                onClick={() => setCurrentSolutionIndex(Math.max(0, currentSolutionIndex - 1))}
                disabled={currentSolutionIndex === 0}
                className="px-2 py-1 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-700 rounded text-sm"
              >
                ←
              </button>
              <button
                onClick={() => setCurrentSolutionIndex(Math.min(solutions.length - 1, currentSolutionIndex + 1))}
                disabled={currentSolutionIndex === solutions.length - 1}
                className="px-2 py-1 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-700 rounded text-sm"
              >
                →
              </button>
            </div>
          </div>

          {currentSolution && (
            <div className="bg-gray-800 p-3 rounded">
              <div className="flex justify-between items-center mb-2">
                <div className="flex gap-4">
                  <span className="text-red-400">ATK: {currentSolution.totalStats.atk}</span>
                  <span className="text-green-400">HP: {currentSolution.totalStats.hp}</span>
                </div>
                <button
                  onClick={() => applySolution(currentSolution)}
                  className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm transition-colors"
                >
                  Apply
                </button>
              </div>
              <div className="text-xs text-gray-400">
                Pieces: {currentSolution.pieces.length} |
                Total Score: {currentSolution.totalStats.atk + currentSolution.totalStats.hp}
              </div>
            </div>
          )}
        </div>
      )}

      {!isSearching && solutions.length === 0 && (
        <div className="text-sm text-gray-400 text-center">
          Click "Find Solutions" to automatically solve the puzzle
        </div>
      )}
    </div>
  );
};