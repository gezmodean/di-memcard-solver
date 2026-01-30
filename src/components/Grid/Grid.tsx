import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { Cell } from './Cell';

export const Grid: React.FC = () => {
  const { grid, selectedPieceId, hoveredPosition, conflicts } = useGameStore();

  // Debug logging removed to prevent console spam

  const isSelected = (pieceId: string | null): boolean => {
    return pieceId === selectedPieceId;
  };

  const isConflict = (pieceId: string | null): boolean => {
    return pieceId ? conflicts.has(pieceId) : false;
  };

  const isHovered = (x: number, y: number): boolean => {
    return hoveredPosition?.x === x && hoveredPosition?.y === y;
  };

  return (
    <div className="grid-container bg-gray-950 border border-gray-700 p-3 rounded" style={{ backgroundColor: '#0a0a0f' }}>
      <h3 className="text-lg font-bold mb-3 text-center text-white">Grid</h3>
      <div
        className="grid-9x9 grid grid-cols-9 gap-0 bg-gray-800 p-2 rounded border border-gray-600 relative isolate"
        style={{ aspectRatio: '1/1', width: 'fit-content', margin: '0 auto' }}
      >
        {grid.map((row, y) =>
          row.map((pieceId, x) => (
            <Cell
              key={`${x}-${y}`}
              x={x}
              y={y}
              pieceId={pieceId}
              isConflict={isConflict(pieceId)}
              isSelected={isSelected(pieceId)}
              isHovered={isHovered(x, y)}
            />
          ))
        )}
      </div>
    </div>
  );
};