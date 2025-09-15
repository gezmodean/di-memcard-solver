import React, { useState, useEffect } from 'react';
import type { Solution } from '../../lib/types';
import { useGameStore } from '../../store/gameStore';
import { GridSolver } from '../../lib/solver/backtrack';
import { LargeNumberDisplay } from '../UI/LargeNumberDisplay';

interface AutoSolverProps {
  selectedPieceIds: string[];
  onSolutionFound: (solution: Solution | null) => void;
  onTogglePiece: (pieceId: string) => void;
  onSolverStateChange?: (state: { isSearching: boolean; noSolutionFound: boolean; searchType?: 'main' | 'alternatives' }) => void;
}

export const AutoSolver: React.FC<AutoSolverProps> = ({
  selectedPieceIds,
  onSolutionFound,
  onTogglePiece,
  onSolverStateChange
}) => {
  const { pieces, clearGrid, placePiece } = useGameStore();
  const [isSearching, setIsSearching] = useState(false);
  const [searchProgress, setSearchProgress] = useState<{ placedCount: number; totalPieces: number } | null>(null);
  const [lastSolution, setLastSolution] = useState<Solution | null>(null);
  const [isSearchingAlternatives, setIsSearchingAlternatives] = useState(false);
  const [alternativePieces, setAlternativePieces] = useState<string[]>([]);
  const [hasSearchedAlternatives, setHasSearchedAlternatives] = useState(false);
  const [noSolutionFound, setNoSolutionFound] = useState(false);

  const availablePieces = pieces.filter(p =>
    selectedPieceIds.includes(p.id) && p.unlocked
  );

  // Clear alternatives when piece selection changes
  useEffect(() => {
    setAlternativePieces([]);
    setHasSearchedAlternatives(false);
    setNoSolutionFound(false);
  }, [selectedPieceIds]);

  // Notify parent of solver state changes
  useEffect(() => {
    if (onSolverStateChange) {
      onSolverStateChange({
        isSearching,
        noSolutionFound,
        searchType: isSearchingAlternatives ? 'alternatives' : 'main'
      });
    }
  }, [isSearching, noSolutionFound, onSolverStateChange, isSearchingAlternatives]);

  const handleSolve = async () => {
    if (availablePieces.length === 0) {
      alert('Please select some pieces first!');
      return;
    }

    setIsSearching(true);
    setSearchProgress(null);
    setLastSolution(null);
    setAlternativePieces([]); // Clear previous alternative pieces
    setHasSearchedAlternatives(false); // Reset search state
    setNoSolutionFound(false); // Clear previous no solution state

    // Small delay to ensure overlay is visible before starting solver
    await new Promise(resolve => setTimeout(resolve, 100));


    try {
      const solver = new GridSolver({
        maxSolutions: 1, // Just find the first good solution
        timeoutMs: 15000, // 15 seconds
        onProgress: setSearchProgress
      });

      const solutions = solver.solve(pieces, selectedPieceIds);

      if (solutions.length > 0) {
        const solution = solutions[0];
        setLastSolution(solution);
        onSolutionFound(solution);

        // Apply the solution to the grid
        clearGrid();
        setTimeout(() => {
          solution.pieces.forEach(piece => {
            placePiece(piece.pieceId, piece.x, piece.y, piece.rotation);
          });
        }, 100);
      } else {
        onSolutionFound(null);
        setNoSolutionFound(true);
      }
    } catch (error) {
      console.error('Error during solving:', error);
      alert('An error occurred while solving. Please try again.');
    } finally {
      setIsSearching(false);
      setSearchProgress(null);
      // The useEffect will handle notifying the parent of state changes
    }
  };


  const findWhatElseFits = async () => {
    if (!lastSolution) return;

    setIsSearchingAlternatives(true);
    setIsSearching(true);  // Also set isSearching to trigger overlay
    setAlternativePieces([]);

    // Small delay to ensure overlay is visible before starting search
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      // Get unselected but unlocked pieces
      const unselectedPieces = pieces.filter(p =>
        !selectedPieceIds.includes(p.id) && p.unlocked
      );

      // Test each piece to see if it fits with the current solution
      const fittingPieces: string[] = [];

      for (let i = 0; i < unselectedPieces.length; i++) {
        const piece = unselectedPieces[i];

        // Yield to event loop every few iterations to prevent blocking
        if (i % 3 === 0) {
          await new Promise(resolve => setTimeout(resolve, 0));
        }

        const testPieceIds = [...selectedPieceIds, piece.id];

        try {
          const solver = new GridSolver({
            maxSolutions: 1,
            timeoutMs: 1500 // Reduced timeout for faster testing
          });

          const solutions = solver.solve(pieces, testPieceIds);

          if (solutions.length > 0) {
            // Check if the solution includes the test piece
            const solutionPieceIds = solutions[0].pieces.map(p => p.pieceId);
            if (solutionPieceIds.includes(piece.id)) {
              fittingPieces.push(piece.id);
            }
          }
        } catch (error) {
          // Ignore timeout or other errors for individual piece tests
          console.log(`Could not test piece ${piece.id}:`, error);
        }
      }

      setAlternativePieces(fittingPieces);
      setHasSearchedAlternatives(true);
    } catch (error) {
      console.error('Error finding alternative pieces:', error);
      setHasSearchedAlternatives(true);
    } finally {
      setIsSearchingAlternatives(false);
      setIsSearching(false);  // Clear isSearching to hide overlay
      // The useEffect will handle notifying the parent of state changes
    }
  };

  return (
    <div className="bg-gray-950 border border-gray-700 rounded p-3" style={{ backgroundColor: '#0a0a0f' }}>
      <h3 className="text-lg font-bold mb-3 text-white">Auto Solver</h3>

      {/* Piece Count Summary */}
      <div className="mb-3 p-3 bg-gray-900/50 border border-gray-700/50 rounded">
        <div className="text-sm text-gray-200 mb-1 font-medium">
          Selected: {availablePieces.length} pieces
        </div>
        {availablePieces.length > 0 && (
          <div className="text-xs text-gray-400">
            Cells: {availablePieces.reduce((total, piece) =>
              total + piece.shape.flat().filter(cell => cell === 1).length, 0
            )} / 81
          </div>
        )}
      </div>

      {/* Solver Controls */}
      <div className="space-y-2">
        <button
          onClick={handleSolve}
          disabled={isSearching || availablePieces.length === 0}
          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 border border-blue-500/50 hover:border-blue-400 disabled:border-gray-600 rounded transition-all duration-200 font-medium text-white"
        >
          {isSearching ? 'Solving...' : 'Find Any Solution'}
        </button>

      </div>

      {/* Progress Display */}
      {isSearching && searchProgress && (
        <div className="mt-3 p-3 bg-gray-900/50 border border-gray-700/50 rounded">
          <div className="text-sm text-gray-200 mb-2 font-medium">
            Searching for optimal placement...
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2 border border-gray-600">
            <div
              className="bg-gradient-to-r from-blue-600 to-blue-500 h-2 rounded-full transition-all duration-500 relative overflow-hidden"
              style={{
                width: `${(searchProgress.placedCount / searchProgress.totalPieces) * 100}%`
              }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse" />
            </div>
          </div>
          <div className="text-xs text-gray-400 mt-2 flex justify-between">
            <span>Pieces: {searchProgress.placedCount}/{searchProgress.totalPieces}</span>
            <span>{Math.round((searchProgress.placedCount / searchProgress.totalPieces) * 100)}%</span>
          </div>
        </div>
      )}

      {/* Last Solution Stats */}
      {lastSolution && !isSearching && (
        <div className="mt-3 p-3 bg-gray-900/50 border border-green-500/30 rounded">
          <div className="text-sm font-bold text-green-400 mb-2 flex items-center">
            <span className="text-green-400 mr-2">✓</span>
            Solution Found!
          </div>
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="text-center bg-red-500/10 border border-red-500/30 rounded p-2">
              <div className="text-red-400 font-bold text-lg">
                <LargeNumberDisplay value={lastSolution.totalStats.atk} />
              </div>
              <div className="text-gray-400 text-xs font-medium">ATK</div>
            </div>
            <div className="text-center bg-green-500/10 border border-green-500/30 rounded p-2">
              <div className="text-green-400 font-bold text-lg">
                <LargeNumberDisplay value={lastSolution.totalStats.hp} />
              </div>
              <div className="text-gray-400 text-xs font-medium">HP</div>
            </div>
            <div className="text-center bg-blue-500/10 border border-blue-500/30 rounded p-2">
              <div className="text-blue-400 font-bold text-lg">{lastSolution.pieces.length}</div>
              <div className="text-gray-400 text-xs font-medium">Pieces</div>
            </div>
          </div>
        </div>
      )}

      {/* What Else Fits Section */}
      {lastSolution && !isSearching && (
        <div className="mt-3">
          <button
            onClick={findWhatElseFits}
            disabled={isSearchingAlternatives}
            className="w-full px-3 py-2 bg-yellow-600/80 hover:bg-yellow-600 disabled:bg-gray-700 disabled:text-gray-500 border border-yellow-500/50 hover:border-yellow-400 disabled:border-gray-600 rounded text-sm transition-all duration-200 font-medium text-white"
          >
            {isSearchingAlternatives ? 'Finding alternatives...' : 'What Else Fits?'}
          </button>

          {alternativePieces.length > 0 && (
            <div className="mt-2 p-2 bg-gray-900/50 border border-yellow-500/30 rounded">
              <div className="text-sm font-medium text-yellow-400 mb-2">
                Additional pieces that could fit:
              </div>
              <div className="flex flex-wrap gap-1">
                {alternativePieces.map(pieceId => {
                  const piece = pieces.find(p => p.id === pieceId);
                  if (!piece) return null;

                  return (
                    <button
                      key={pieceId}
                      onClick={() => onTogglePiece(pieceId)}
                      className="flex items-center gap-1 bg-yellow-500/20 border border-yellow-500/40 rounded px-2 py-1 hover:bg-yellow-500/30 hover:border-yellow-400/60 transition-all duration-150 cursor-pointer"
                      title={`Click to select ${piece.name}`}
                    >
                      {piece.iconFile ? (
                        <img
                          src={`/icons/${piece.iconFile}`}
                          alt={piece.name}
                          className="w-4 h-4 object-contain"
                        />
                      ) : (
                        <span className="text-xs">{piece.icon}</span>
                      )}
                      <span className="text-xs text-yellow-200">{piece.name}</span>
                      <span className="text-xs text-yellow-400 ml-1">+</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {alternativePieces.length === 0 && !isSearchingAlternatives && hasSearchedAlternatives && (
            <div className="mt-2 p-2 bg-gray-900/50 border border-gray-500/30 rounded text-xs text-gray-400 text-center">
              No additional pieces can fit with the current selection.
            </div>
          )}
        </div>
      )}

      <div className="mt-3 text-xs text-gray-500 text-center leading-relaxed">
        Select memory cards, then click solve to find optimal placement.
      </div>
    </div>
  );
};