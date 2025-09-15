import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { getMaxLevel } from '../../lib/pieces/rarityProgression';
import type { Piece } from '../../lib/types';

interface PieceInventoryProps {
  selectedPieceIds: string[];
  onTogglePiece: (pieceId: string) => void;
  onViewPiece?: (pieceId: string) => void;
}

export const PieceInventory: React.FC<PieceInventoryProps> = ({
  selectedPieceIds,
  onTogglePiece,
  onViewPiece
}) => {
  const { pieces, togglePieceLock, updatePieceLevel } = useGameStore();

  // Group pieces by rarity for better organization
  const groupedPieces = pieces.reduce((groups, piece) => {
    if (!groups[piece.rarity]) {
      groups[piece.rarity] = [];
    }
    groups[piece.rarity].push(piece);
    return groups;
  }, {} as Record<string, Piece[]>);

  const rarityOrder = ['transcendent', 'mythic', 'legendary', 'epic', 'rare', 'uncommon', 'common'];

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

  const isSelected = (pieceId: string) => selectedPieceIds.includes(pieceId);

  // Calculate current total cells used by selected pieces
  const getCurrentTotalCells = () => {
    return selectedPieceIds.reduce((total, pieceId) => {
      const piece = pieces.find(p => p.id === pieceId);
      if (!piece) return total;
      return total + piece.shape.flat().filter(cell => cell === 1).length;
    }, 0);
  };

  // Check if selecting a piece would exceed 81 cells
  const canSelectPiece = (piece: Piece) => {
    if (isSelected(piece.id)) return true; // Can always deselect

    const currentCells = getCurrentTotalCells();
    const pieceCells = piece.shape.flat().filter(cell => cell === 1).length;

    return currentCells + pieceCells <= 81;
  };

  const PieceIcon: React.FC<{ piece: Piece }> = ({ piece }) => {
    const selected = isSelected(piece.id);
    const canSelect = canSelectPiece(piece);
    const isSelectable = piece.unlocked && canSelect;

    const handleClick = () => {
      if (!piece.unlocked) return;

      if (!selected && !canSelect) {
        // Show a brief warning if trying to select a piece that would exceed limit
        const currentCells = getCurrentTotalCells();
        const pieceCells = piece.shape.flat().filter(cell => cell === 1).length;
        alert(`Cannot select "${piece.name}". Current total: ${currentCells} cells. Adding this piece (${pieceCells} cells) would exceed the 81 cell limit.`);
        return;
      }

      onTogglePiece(piece.id);
    };

    const handleRightClick = (e: React.MouseEvent) => {
      e.preventDefault();
      if (onViewPiece) {
        onViewPiece(piece.id);
      }
    };

    return (
      <div
        onClick={handleClick}
        onContextMenu={handleRightClick}
        className={`
          relative transition-all duration-150 rounded overflow-hidden border-2
          ${isSelectable ? 'cursor-pointer hover:brightness-110' : 'cursor-not-allowed opacity-40'}
          ${!canSelect && !selected ? 'saturate-50' : ''}
          ${selected ? 'border-white shadow-lg shadow-white/50' : 'border-gray-700/50'}
        `}
        style={{
          backgroundColor: getRarityColor(piece.rarity),
          width: '72px',
          height: '72px',
        }}
      >
        {/* Inner border for that polished game look */}
        <div className="absolute inset-1 rounded border border-white/30" />

        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/15 via-transparent to-black/20" />

        {/* Level indicator */}
        <div className="absolute top-1 right-1 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded font-bold" style={{ fontSize: '9px' }}>
          {piece.level}
        </div>

        {/* Main icon area */}
        <div className="absolute inset-0 flex items-center justify-center">
          {piece.iconFile ? (
            <img
              src={`/icons/${piece.iconFile}`}
              alt={piece.name}
              className="w-12 h-12 object-contain"
              style={{
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.8))',
                imageRendering: 'pixelated'
              }}
            />
          ) : (
            <span
              className="text-3xl font-bold"
              style={{
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.8))',
                textShadow: '0 2px 4px rgba(0,0,0,0.8)'
              }}
            >
              {piece.icon}
            </span>
          )}
        </div>

        {/* Selection glow */}
        {selected && (
          <>
            <div className="absolute inset-0 bg-white/20 rounded" />
            <div className="absolute inset-0 animate-pulse bg-white/10 rounded" />
          </>
        )}

        {/* Lock overlay for visual indication */}
        {!piece.unlocked && (
          <div className="absolute inset-0 bg-black/40 rounded" />
        )}

        {/* Lock/Unlock toggle button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            togglePieceLock(piece.id);
          }}
          className="absolute top-1 left-1 w-5 h-5 flex items-center justify-center rounded-full text-xs transition-all duration-150 hover:scale-110 z-10"
          style={{
            backgroundColor: piece.unlocked ? 'rgba(34, 197, 94, 0.8)' : 'rgba(239, 68, 68, 0.8)',
            backdropFilter: 'blur(4px)'
          }}
          title={piece.unlocked ? 'Unlocked' : 'Locked'}
        >
          <span className="text-white" style={{ fontSize: '10px' }}>
            {piece.unlocked ? '🔓' : '🔒'}
          </span>
        </button>
      </div>
    );
  };

  return (
    <div className="bg-gray-950 border border-gray-700 rounded p-3 h-full" style={{ backgroundColor: '#0a0a0f' }}>
      <div className="flex justify-between items-center mb-3">
        <div>
          <h2 className="text-lg font-bold text-white">Memory Cards</h2>
          {onViewPiece && (
            <div className="text-xs text-gray-400 mt-1">
              Right-click to view details
            </div>
          )}
        </div>
        <div className="bg-gray-800 px-2 py-1 rounded text-sm text-gray-300 border border-gray-600">
          Selected: {selectedPieceIds.length} pieces
          <div className="text-xs text-gray-400 mt-0.5">
            {getCurrentTotalCells()}/81 cells
          </div>
        </div>
      </div>

      <div className="space-y-3 overflow-y-auto max-h-[600px] pr-1" style={{ scrollbarWidth: 'thin' }}>
        {rarityOrder.map(rarity => {
          const piecesInRarity = groupedPieces[rarity] || [];
          if (piecesInRarity.length === 0) return null;

          return (
            <div key={rarity} className="bg-gray-900/50 border border-gray-700/50 rounded p-2">
              <div className="flex items-center justify-between mb-2">
                <div
                  className="text-sm font-bold capitalize px-2 py-1 rounded border"
                  style={{
                    color: getRarityColor(rarity),
                    borderColor: getRarityColor(rarity) + '40',
                    backgroundColor: getRarityColor(rarity) + '10'
                  }}
                >
                  {rarity}
                </div>
                <span className="text-xs text-gray-400">({piecesInRarity.length})</span>
              </div>

              <div className="grid grid-cols-4 gap-1.5">
                {piecesInRarity.map(piece => (
                  <div key={piece.id} className="relative group">
                    <PieceIcon piece={piece} />

                    {/* Enhanced tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black/90 text-white text-xs rounded border border-gray-600 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 font-medium">
                      {piece.name}
                      <div className="text-gray-400 text-xs">
                        ATK: {piece.baseStats.atk} | HP: {piece.baseStats.hp}
                      </div>
                      <div className="text-yellow-400 text-xs mt-1">
                        Level {piece.level}
                      </div>
                    </div>

                    {/* Level editing controls */}
                    {piece.unlocked && (
                      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto z-30">
                        <div className="flex items-center gap-1 bg-black/90 border border-gray-600 rounded px-2 py-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (piece.level > 1) {
                                updatePieceLevel(piece.id, piece.level - 1);
                              }
                            }}
                            disabled={piece.level <= 1}
                            className="text-white text-xs w-4 h-4 flex items-center justify-center rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            -
                          </button>
                          <span className="text-white text-xs min-w-6 text-center font-medium">
                            {piece.level}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const maxLevel = getMaxLevel(piece.limitBreaks || []);
                              if (piece.level < maxLevel) {
                                updatePieceLevel(piece.id, piece.level + 1);
                              }
                            }}
                            disabled={piece.level >= getMaxLevel(piece.limitBreaks || [])}
                            className="text-white text-xs w-4 h-4 flex items-center justify-center rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {selectedPieceIds.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-700">
          <button
            onClick={() => selectedPieceIds.forEach(id => onTogglePiece(id))}
            className="w-full px-3 py-2 bg-red-600/80 hover:bg-red-600 border border-red-500/50 hover:border-red-400 rounded text-sm transition-all duration-200 font-medium text-white"
          >
            Clear Selection ({selectedPieceIds.length})
          </button>
        </div>
      )}
    </div>
  );
};