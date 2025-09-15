import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { getActiveSpecialEffects } from '../../lib/utils/specialEffects';
import type { Piece } from '../../lib/types';

export const SpecialEffectsPanel: React.FC = () => {
  const { placedPieces, pieces } = useGameStore();
  const [isExpanded, setIsExpanded] = useState(true);

  const getActiveEffects = () => {
    const allEffects: { piece: Piece; effects: string[] }[] = [];
    const alwaysActiveEffects: { piece: Piece; effects: string[] }[] = [];

    pieces.forEach(piece => {
      const isOnField = placedPieces.has(piece.id);
      const activeEffects = getActiveSpecialEffects(piece, isOnField);

      if (activeEffects.length > 0) {
        if (isOnField) {
          allEffects.push({ piece, effects: activeEffects });
        } else {
          // Check if piece has always-active effects (requiresOnField: false)
          const alwaysActive = piece.specialEffects?.filter(effect =>
            effect.requiresOnField === false
          ) || [];

          if (alwaysActive.length > 0) {
            const alwaysActiveProcessed = getActiveSpecialEffects(piece, false);
            alwaysActiveEffects.push({ piece, effects: alwaysActiveProcessed });
          }
        }
      }
    });

    return { fieldEffects: allEffects, alwaysActiveEffects };
  };

  const { fieldEffects, alwaysActiveEffects } = getActiveEffects();
  const totalEffects = fieldEffects.length + alwaysActiveEffects.length;

  return (
    <div className="bg-gray-950 border border-gray-700 p-3 rounded" style={{ backgroundColor: '#0a0a0f' }}>
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-bold text-white">
          Active Special Effects
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
          {/* Field Effects */}
          {fieldEffects.length > 0 && (
            <div className="mb-4">
              <div className="text-sm font-medium mb-2 text-blue-400">
                🔸 Active on Field ({fieldEffects.length})
              </div>
              <div className="space-y-2">
                {fieldEffects.map(({ piece, effects }, index) => (
                  <div
                    key={`field-${piece.id}-${index}`}
                    className="bg-blue-500/10 border border-blue-500/30 rounded p-2"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {piece.iconFile ? (
                        <img
                          src={`/icons/${piece.iconFile}`}
                          alt={piece.name}
                          className="w-4 h-4 object-contain"
                        />
                      ) : (
                        <span className="text-sm">{piece.icon}</span>
                      )}
                      <span className="text-sm font-medium text-white">
                        {piece.name} (Lv.{piece.level})
                      </span>
                    </div>
                    {effects.map((effect, effIndex) => (
                      <div
                        key={effIndex}
                        className="text-xs text-blue-300 ml-6"
                      >
                        • {effect}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Always Active Effects */}
          {alwaysActiveEffects.length > 0 && (
            <div className="mb-4">
              <div className="text-sm font-medium mb-2 text-green-400">
                🔹 Always Active ({alwaysActiveEffects.length})
              </div>
              <div className="space-y-2">
                {alwaysActiveEffects.map(({ piece, effects }, index) => (
                  <div
                    key={`always-${piece.id}-${index}`}
                    className="bg-green-500/10 border border-green-500/30 rounded p-2"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {piece.iconFile ? (
                        <img
                          src={`/icons/${piece.iconFile}`}
                          alt={piece.name}
                          className="w-4 h-4 object-contain"
                        />
                      ) : (
                        <span className="text-sm">{piece.icon}</span>
                      )}
                      <span className="text-sm font-medium text-white">
                        {piece.name} (Lv.{piece.level})
                      </span>
                    </div>
                    {effects.map((effect, effIndex) => (
                      <div
                        key={effIndex}
                        className="text-xs text-green-300 ml-6"
                      >
                        • {effect}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

        </>
      )}
    </div>
  );
};