import React from 'react';
import type { Piece } from '../../lib/types';
import { RARITY_COLORS } from '../../lib/types';
import { useGameStore } from '../../store/gameStore';
import { calculatePieceStats } from '../../lib/pieces/definitions';

interface PieceCardProps {
  piece: Piece;
  isPlaced: boolean;
}

export const PieceCard: React.FC<PieceCardProps> = ({ piece, isPlaced }) => {
  const { removePiece, updatePieceLevel, selectedPieceId, selectPiece, rarityConfigs } = useGameStore();
  const stats = calculatePieceStats(piece, rarityConfigs);

  const handleClick = () => {
    if (isPlaced) {
      removePiece(piece.id);
    } else if (piece.unlocked) {
      selectPiece(piece.id);
    }
  };

  const handleLevelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const newLevel = parseInt(e.target.value);
    if (!isNaN(newLevel)) {
      updatePieceLevel(piece.id, newLevel);
    }
  };

  const getBorderColor = () => {
    if (selectedPieceId === piece.id) return 'ring-2 ring-green-400';
    if (isPlaced) return 'ring-2 ring-blue-400';
    return '';
  };

  return (
    <div
      className={`
        border-2 rounded-lg p-3
        cursor-pointer transition-all duration-200 hover:brightness-125
        ${getBorderColor()}
        ${!piece.unlocked ? 'opacity-50 cursor-not-allowed' : ''}
      `}
      style={{
        backgroundColor: `${RARITY_COLORS[piece.rarity]}20`,
        borderColor: `${RARITY_COLORS[piece.rarity]}40`,
      }}
      onClick={handleClick}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{piece.icon}</span>
        <div className="text-right">
          <div className="text-xs capitalize" style={{ color: RARITY_COLORS[piece.rarity] }}>{piece.rarity}</div>
          <div className="text-xs text-red-400">ATK: {stats.atk}</div>
          <div className="text-xs text-green-400">HP: {stats.hp}</div>
        </div>
      </div>

      <div className="text-sm font-medium mb-2 text-center">{piece.name}</div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">Lv.</span>
        <input
          id={`piece-level-${piece.id}`}
          name={`piece-level-${piece.id}`}
          type="number"
          min={1}
          max={200}
          value={piece.level}
          onChange={handleLevelChange}
          onClick={(e) => e.stopPropagation()}
          className="w-12 text-xs bg-gray-800 border border-gray-600 rounded px-1 text-center"
          disabled={!piece.unlocked}
          aria-label={`Level for ${piece.name}`}
        />
      </div>

      {!piece.unlocked && (
        <div className="text-xs text-red-400 text-center mt-1">Locked</div>
      )}
    </div>
  );
};