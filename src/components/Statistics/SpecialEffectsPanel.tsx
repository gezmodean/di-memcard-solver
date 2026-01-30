import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import type { Piece } from '../../lib/types';
import { getIconPath } from '../../utils/assetPaths';
import { SkillDescription } from '../UI/SkillDescription';

export const SpecialEffectsPanel: React.FC = () => {
  const { placedPieces, pieces } = useGameStore();
  const [isExpanded, setIsExpanded] = useState(true);

  // Gather equipped pieces that have skill descriptions or equip effects
  const equippedPiecesWithSkills = pieces.filter(piece => {
    if (!placedPieces.has(piece.id)) return false;
    const hasDescription = !!piece.gameData?.description;
    const hasEquipEffects = piece.levelTable && piece.levelTable.equipEffects.length > 0;
    return hasDescription || hasEquipEffects;
  });

  const totalEffects = equippedPiecesWithSkills.length;

  const renderPieceIcon = (piece: Piece) => (
    piece.iconFile ? (
      <img
        src={getIconPath(piece.iconFile)}
        alt={piece.name}
        className="w-4 h-4 object-contain"
        style={{ imageRendering: 'pixelated' }}
      />
    ) : (
      <span className="text-sm">{piece.icon}</span>
    )
  );

  return (
    <div className="bg-gray-950 border border-gray-700 p-3 rounded" style={{ backgroundColor: '#0a0a0f' }}>
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-bold text-white">
          Active Bonuses
          {totalEffects > 0 && (
            <span className="ml-2 text-sm bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">
              {totalEffects}
            </span>
          )}
        </h3>
        {totalEffects > 0 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-gray-400 hover:text-white transition-colors"
          >
            {isExpanded ? '▲ Hide' : '▼ Show'}
          </button>
        )}
      </div>

      {isExpanded && (
        <>
          {/* Bonuses from Equipped Cards */}
          {equippedPiecesWithSkills.length > 0 && (
            <div className="mb-4">
              <div className="text-sm font-medium mb-2 text-blue-400">
                Bonuses from Equipped Cards ({equippedPiecesWithSkills.length})
              </div>
              <div className="space-y-2">
                {equippedPiecesWithSkills.map((piece, index) => (
                  <div
                    key={`equip-${piece.id}-${index}`}
                    className="bg-blue-500/10 border border-blue-500/30 rounded p-2"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {renderPieceIcon(piece)}
                      <span className="text-sm font-medium text-white">
                        {piece.name} (Lv.{piece.level})
                      </span>
                    </div>
                    {piece.gameData?.description && (
                      <div className="text-xs text-blue-200 ml-6">
                        <SkillDescription piece={piece} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {totalEffects === 0 && (
            <div className="text-sm text-gray-500 text-center py-2">
              No equipped cards. Place cards on the grid to see their bonuses.
            </div>
          )}
        </>
      )}
    </div>
  );
};
