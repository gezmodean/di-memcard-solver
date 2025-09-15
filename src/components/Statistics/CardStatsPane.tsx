import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { getActiveSpecialEffects, processSpecialEffectDescription } from '../../lib/utils/specialEffects';
import { calculatePieceStats } from '../../lib/pieces/definitions';
import { getMaxLevel } from '../../lib/pieces/rarityProgression';
import { LargeNumberDisplay } from '../UI/LargeNumberDisplay';

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

  const isOnField = placedPieces.has(piece.id);
  const isConflicted = conflicts.has(piece.id);
  const currentStats = calculatePieceStats(piece);
  const activeEffects = getActiveSpecialEffects(piece, isOnField);

  // Calculate level progression
  const baseStats = piece.baseStats;
  const levelBonus = {
    atk: currentStats.atk - baseStats.atk,
    hp: currentStats.hp - baseStats.hp
  };

  // Get shape info
  const shapeRows = piece.shape.length;
  const shapeCols = piece.shape.length > 0 ? piece.shape[0].length : 0;
  const totalCells = piece.shape.flat().filter(cell => cell === 1).length;

  // Get current progression info
  const maxLevel = getMaxLevel(piece.limitBreaks || []);



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

          {/* Limit break stars */}
          {piece.limitBreaks && piece.limitBreaks.length > 0 && (
            <div className="absolute bottom-1 left-1 flex z-20">
              {piece.limitBreaks.map((breakLevel, index) => (
                <span
                  key={breakLevel}
                  className="text-xs text-yellow-300"
                  style={{
                    fontSize: '10px',
                    marginLeft: index > 0 ? '-2px' : '0',
                    filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.8))'
                  }}
                >
                  ⭐
                </span>
              ))}
            </div>
          )}

          {/* Icon */}
          <div className="relative z-10">
            {piece.iconFile ? (
              <img
                src={`/icons/${piece.iconFile}`}
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
              isOnField
                ? isConflicted
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
            }`}>
              {isOnField ? (isConflicted ? 'Conflicted' : 'On Field') : 'In Inventory'}
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

      {/* Power for owning card */}
      <div className="bg-gray-900/50 border border-gray-700/50 rounded p-2 mb-4">
        <div className="text-xs text-gray-400 mb-1">Power for owning card</div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-red-400 font-semibold">ATK:</span>
            <span className="text-white font-bold"><LargeNumberDisplay value={currentStats.atk} /></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-400 font-semibold">HP:</span>
            <span className="text-white font-bold"><LargeNumberDisplay value={currentStats.hp} /></span>
          </div>
        </div>
      </div>


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

      {/* Special Effects */}
      {piece.specialEffects && piece.specialEffects.length > 0 && (
        <div className="mb-4">
          <div className="text-sm font-medium text-white mb-2">Special Effects</div>
          <div className="space-y-2">
            {piece.specialEffects.map((effect, index) => (
              <div
                key={index}
                className={`p-2 rounded border text-sm ${
                  activeEffects.some(active => active.includes(effect.description.split(' ')[0]))
                    ? 'bg-blue-500/10 border-blue-500/30 text-blue-300'
                    : 'bg-gray-500/10 border-gray-500/30 text-gray-400'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-1.5 py-0.5 rounded ${
                    effect.requiresOnField === false
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {effect.requiresOnField === false ? 'Always Active' : 'Field Only'}
                  </span>
                </div>
                <div
                  className="mt-1"
                  dangerouslySetInnerHTML={{
                    __html: processSpecialEffectDescription(effect, piece.level, piece.limitBreaks || [])
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}


      {/* Level Info */}
      <div className="text-xs text-gray-400 text-center">
        Level {piece.level} / {maxLevel}
        {levelBonus.atk > 0 || levelBonus.hp > 0 ? (
          <div className="mt-1">
            Level bonus: <LargeNumberDisplay value={levelBonus.atk} /> ATK, <LargeNumberDisplay value={levelBonus.hp} /> HP
          </div>
        ) : null}
      </div>
    </div>
  );
};