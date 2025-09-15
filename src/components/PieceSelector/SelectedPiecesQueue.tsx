import React from 'react';
import { useGameStore } from '../../store/gameStore';
import type { Piece } from '../../lib/types';
import { formatLargeNumber } from '../../lib/utils/numberFormat';

interface SelectedPiecesQueueProps {
  selectedPieceIds: string[];
  onTogglePiece: (pieceId: string) => void;
  onViewPiece?: (pieceId: string) => void;
  onClearGrid?: () => void;
}

export const SelectedPiecesQueue: React.FC<SelectedPiecesQueueProps> = ({
  selectedPieceIds,
  onTogglePiece,
  onViewPiece,
  onClearGrid
}) => {
  const { pieces, getTotalStats } = useGameStore();

  const selectedPieces = selectedPieceIds
    .map(id => pieces.find(p => p.id === id))
    .filter((piece): piece is Piece => piece !== undefined);

  const getRarityColor = (rarity: string) => {
    const colorMap: Record<string, string> = {
      common: '#868aaf',
      uncommon: '#ccac94',
      rare: '#35ff81',
      epic: '#448aff',
      legendary: '#fff35c',
      mythic: '#9b6bec',
      transcendent: '#ff38af',
    };
    return colorMap[rarity] || '#868aaf';
  };

  const getTotalCells = () => {
    return selectedPieces.reduce((total, piece) => {
      return total + piece.shape.flat().filter(cell => cell === 1).length;
    }, 0);
  };


  if (selectedPieceIds.length === 0) {
    return (
      <div className="bg-gray-950 border border-gray-700 rounded p-3" style={{ backgroundColor: '#0a0a0f' }}>
        <h3 className="text-lg font-bold mb-3 text-white">Selected Cards Queue</h3>

        {/* Collection Totals - Even when empty */}
        <div className="bg-gray-900/50 border border-gray-700/50 rounded p-2 mb-3">
          <div className="text-xs text-gray-400 mb-1">Total Collection Power</div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-red-400 font-semibold">ATK:</span>
              <span className="text-white font-bold">{formatLargeNumber(getTotalStats().atk)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-400 font-semibold">HP:</span>
              <span className="text-white font-bold">{formatLargeNumber(getTotalStats().hp)}</span>
            </div>
          </div>
        </div>

        <div className="text-center py-8 text-gray-400">
          <div className="text-4xl mb-2">📋</div>
          <div className="text-sm">No cards selected</div>
          <div className="text-xs mt-1">Select cards from the inventory to build your queue</div>
        </div>
      </div>
    );
  }

  const totalCells = getTotalCells();

  return (
    <div className="bg-gray-950 border border-gray-700 rounded p-3" style={{ backgroundColor: '#0a0a0f' }}>
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-bold text-white">
          Selected Cards Queue
          <span className="ml-2 text-sm bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">
            {selectedPieces.length}
          </span>
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => selectedPieceIds.forEach(id => onTogglePiece(id))}
            className="text-xs text-red-400 hover:text-red-300 px-2 py-1 border border-red-500/30 rounded hover:bg-red-500/10 transition-all"
          >
            Clear Queue
          </button>
          {onClearGrid && (
            <button
              onClick={onClearGrid}
              className="text-xs text-orange-400 hover:text-orange-300 px-2 py-1 border border-orange-500/30 rounded hover:bg-orange-500/10 transition-all"
            >
              Clear Grid
            </button>
          )}
        </div>
      </div>

      {/* Summary Info */}
      <div className="mb-3">
        <div className="flex justify-between items-center text-sm text-gray-300 mb-2">
          <div className="flex items-center gap-4">
            <div>{selectedPieces.length} pieces selected</div>
            <div>{totalCells}/81 cells</div>
          </div>
        </div>

        {/* Collection Totals */}
        <div className="bg-gray-900/50 border border-gray-700/50 rounded p-2">
          <div className="text-xs text-gray-400 mb-1">Total Collection Power</div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-red-400 font-semibold">ATK:</span>
              <span className="text-white font-bold">{formatLargeNumber(getTotalStats().atk)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-400 font-semibold">HP:</span>
              <span className="text-white font-bold">{formatLargeNumber(getTotalStats().hp)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Pieces Queue - Horizontal */}
      <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'thin' }}>
        {selectedPieces.map((piece, index) => (
          <div
            key={piece.id}
            className="relative flex-shrink-0 bg-gray-900/50 border border-gray-700/50 rounded p-2 hover:bg-gray-800/50 transition-all group cursor-pointer"
            onContextMenu={(e) => {
              e.preventDefault();
              if (onViewPiece) {
                onViewPiece(piece.id);
              }
            }}
            title="Right-click to view details"
            style={{ minWidth: '80px' }}
          >
            {/* Queue Number */}
            <div className="absolute top-1 left-1 w-4 h-4 flex items-center justify-center rounded-full bg-gray-700 text-xs font-bold text-white z-10">
              {index + 1}
            </div>

            {/* Remove Button */}
            <button
              onClick={() => onTogglePiece(piece.id)}
              className="absolute top-1 right-1 w-4 h-4 flex items-center justify-center rounded-full text-red-400 hover:text-red-300 hover:bg-red-500/20 transition-all opacity-0 group-hover:opacity-100 z-10"
              title={`Remove ${piece.name} from queue`}
            >
              <span className="text-xs">×</span>
            </button>

            {/* Piece Icon */}
            <div
              className="relative w-16 h-16 rounded border-2 border-gray-600 flex items-center justify-center overflow-hidden mx-auto"
              style={{
                backgroundColor: getRarityColor(piece.rarity),
              }}
            >
              {/* Inner border */}
              <div className="absolute inset-0.5 rounded border border-white/30" />

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/15 via-transparent to-black/20" />

              {/* Level indicator */}
              <div className="absolute bottom-0 right-0 bg-black/80 text-white text-xs px-1 py-0.5 rounded-tl font-bold" style={{ fontSize: '8px', lineHeight: '1' }}>
                {piece.level}
              </div>

              {/* Icon */}
              <div className="relative z-10">
                {piece.iconFile ? (
                  <img
                    src={`/icons/${piece.iconFile}`}
                    alt={piece.name}
                    className="w-8 h-8 object-contain"
                    style={{
                      filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.8))',
                      imageRendering: 'pixelated'
                    }}
                  />
                ) : (
                  <span
                    className="text-xl font-bold"
                    style={{
                      filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.8))',
                      textShadow: '0 1px 2px rgba(0,0,0,0.8)'
                    }}
                  >
                    {piece.icon}
                  </span>
                )}
              </div>
            </div>

            {/* Piece Name */}
            <div className="mt-2 text-center">
              <div className="text-xs font-medium text-white truncate" style={{ maxWidth: '70px' }}>
                {piece.name}
              </div>
              <div
                className="text-xs px-1 py-0.5 rounded border capitalize mt-1 inline-block"
                style={{
                  color: getRarityColor(piece.rarity),
                  borderColor: getRarityColor(piece.rarity) + '40',
                  backgroundColor: getRarityColor(piece.rarity) + '10'
                }}
              >
                {piece.rarity}
              </div>
            </div>
          </div>
        ))}
      </div>

      {totalCells > 81 && (
        <div className="mt-3 p-2 bg-red-500/10 border border-red-500/30 rounded text-center">
          <div className="text-sm text-red-400 font-medium">
            ⚠️ Exceeds grid limit by {totalCells - 81} cells
          </div>
          <div className="text-xs text-red-300 mt-1">
            Remove some pieces to solve
          </div>
        </div>
      )}
    </div>
  );
};