import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { LargeNumberDisplay } from '../UI/LargeNumberDisplay';
import { SkillDescription } from '../UI/SkillDescription';
import { getIconPath } from '../../utils/assetPaths';
import type { LevelTableEffect } from '../../lib/types';

interface CardStatsPaneProps {
  selectedPieceId: string | null;
  onClose: () => void;
}

export const CardStatsPane: React.FC<CardStatsPaneProps> = ({
  selectedPieceId,
  onClose
}) => {
  const { pieces, placedPieces, conflicts } = useGameStore();

  const piece = selectedPieceId ? pieces.find(p => p.id === selectedPieceId) : null;

  if (!piece) {
    return (
      <div className="bg-gray-950 border border-gray-700 rounded p-3" style={{ backgroundColor: '#0a0a0f' }}>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-bold text-white">Card Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-sm"
          >
            ×
          </button>
        </div>
        <div className="text-center py-8 text-gray-400">
          <div className="text-4xl mb-2">📋</div>
          <div className="text-sm">Click a piece to view details</div>
        </div>
      </div>
    );
  }

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

  const isEquipped = placedPieces.has(piece.id);
  const isConflicted = conflicts.has(piece.id);

  // Get shape info
  const shapeRows = piece.shape.length;
  const shapeCols = piece.shape.length > 0 ? piece.shape[0].length : 0;
  const totalCells = piece.shape.flat().filter(cell => cell === 1).length;

  const maxLevel = piece.gameData?.totalLevels || 200;

  return (
    <div className="bg-gray-950 border border-gray-700 rounded p-3" style={{ backgroundColor: '#0a0a0f' }}>
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-bold text-white">Card Details</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white text-lg w-6 h-6 flex items-center justify-center hover:bg-gray-700 rounded"
        >
          ×
        </button>
      </div>

      {/* Card Header */}
      <div className="flex items-center gap-3 mb-4">
        {/* Card Icon */}
        <div
          className="relative w-16 h-16 rounded border-2 flex items-center justify-center overflow-hidden"
          style={{
            backgroundColor: getRarityColor(piece.rarity),
            borderColor: getRarityColor(piece.rarity),
          }}
        >
          {/* Inner border */}
          <div className="absolute inset-1 rounded border border-white/30" />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/15 via-transparent to-black/20" />

          {/* Level indicator */}
          <div className="absolute top-1 right-1 bg-black/80 text-white text-xs px-1.5 py-1 rounded font-bold z-20">
            {piece.level}
          </div>

          {/* Icon */}
          <div className="relative z-10">
            {piece.iconFile ? (
              <img
                src={getIconPath(piece.iconFile)}
                alt={piece.name}
                className="w-10 h-10 object-contain"
                style={{
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.8))',
                  imageRendering: 'pixelated'
                }}
              />
            ) : (
              <span
                className="text-2xl font-bold"
                style={{
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.8))',
                  textShadow: '0 2px 4px rgba(0,0,0,0.8)'
                }}
              >
                {piece.icon}
              </span>
            )}
          </div>

          {/* Status indicators */}
          {!piece.unlocked && (
            <div className="absolute inset-0 bg-black/40 rounded flex items-center justify-center z-5">
              <span className="text-white text-lg">🔒</span>
            </div>
          )}
        </div>

        {/* Card Info */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-lg font-bold text-white">{piece.name}</h4>
            <div
              className="text-xs px-2 py-1 rounded border capitalize font-medium"
              style={{
                color: getRarityColor(piece.rarity),
                borderColor: getRarityColor(piece.rarity) + '40',
                backgroundColor: getRarityColor(piece.rarity) + '10'
              }}
            >
              {piece.rarity}
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center gap-2 text-sm">
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              isEquipped
                ? isConflicted
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
            }`}>
              {isEquipped ? (isConflicted ? 'Conflicted' : 'Equipped') : 'In Inventory'}
            </span>
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              piece.unlocked
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}>
              {piece.unlocked ? 'Unlocked' : 'Locked'}
            </span>
          </div>
        </div>
      </div>

      {/* Hold Effects (from levelTable) */}
      {piece.levelTable && piece.levelTable.holdEffects.length > 0 && (
        <div className="mb-4 p-3 bg-gray-900/50 border border-gray-700/50 rounded">
          <div className="text-sm font-medium text-green-400 mb-2">Hold Effects (Always Active)</div>
          <div className="space-y-1">
            {piece.levelTable.holdEffects.map((eff: LevelTableEffect, i: number) => {
              const idx = Math.max(0, Math.min(piece.level - 1, eff.values.length - 1));
              const val = eff.values[idx] ?? 0;
              const label = eff.effectType.replace(/_/g, ' ');
              return (
                <div key={i} className="flex justify-between items-center text-xs">
                  <span className="text-gray-300">{label}</span>
                  <span className="text-white font-medium"><LargeNumberDisplay value={val} /></span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Skill Description with formatted variables */}
      {piece.gameData?.description && (
        <div className="mb-4 p-3 bg-gray-900/50 border border-gray-700/50 rounded">
          <div className="text-sm font-medium text-blue-400 mb-1">Skill Description</div>
          <div className="text-xs text-gray-300">
            <SkillDescription piece={piece} />
          </div>
        </div>
      )}

      {/* Shape Info */}
      <div className="mb-4 p-3 bg-gray-900/50 border border-gray-700/50 rounded">
        <div className="text-sm font-medium text-white mb-2">Shape Information</div>
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-300">
          <div>Size: {shapeRows}×{shapeCols}</div>
          <div>Cells: {totalCells}</div>
        </div>

        {/* Shape Visualization */}
        <div className="mt-3">
          <div className="text-xs text-gray-400 mb-2">Shape Preview:</div>
          <div className="grid gap-0.5 mx-auto w-fit" style={{ gridTemplateColumns: `repeat(${shapeCols}, minmax(0, 1fr))` }}>
            {piece.shape.map((row, rowIndex) =>
              row.map((cell, colIndex) => (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={`w-4 h-4 rounded-sm border ${
                    cell === 1
                      ? 'border-gray-400'
                      : 'border-gray-700/50'
                  }`}
                  style={{
                    backgroundColor: cell === 1 ? getRarityColor(piece.rarity) + '60' : 'transparent'
                  }}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Level Info */}
      <div className="text-xs text-gray-400 text-center">
        Level {piece.level} / {maxLevel}
      </div>
    </div>
  );
};
