import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { PieceCard } from './PieceCard';
import type { Rarity } from '../../lib/types';

export const PieceSelector: React.FC = () => {
  const { pieces, placedPieces } = useGameStore();
  const [selectedRarity, setSelectedRarity] = useState<Rarity | 'all'>('all');

  const rarities: (Rarity | 'all')[] = ['all', 'common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic', 'transcendent'];

  const filteredPieces = pieces.filter(piece =>
    selectedRarity === 'all' || piece.rarity === selectedRarity
  );

  const getRarityColor = (rarity: Rarity | 'all') => {
    if (rarity === 'all') return 'bg-gray-600';

    const colorMap: Record<string, string> = {
      common: 'bg-gray-600',
      uncommon: 'bg-green-600',
      rare: 'bg-blue-600',
      epic: 'bg-purple-600',
      legendary: 'bg-amber-600',
      mythic: 'bg-red-600',
      transcendent: 'bg-pink-600',
    };
    return colorMap[rarity] || 'bg-gray-600';
  };

  return (
    <div className="bg-gray-900 p-4 rounded-lg shadow-lg h-full">
      <h2 className="text-xl font-bold mb-4 text-center">Memory Cards</h2>

      {/* Rarity Filter */}
      <div className="mb-4">
        <div className="grid grid-cols-4 gap-1 text-xs">
          {rarities.map(rarity => (
            <button
              key={rarity}
              onClick={() => setSelectedRarity(rarity)}
              className={`
                px-2 py-1 rounded capitalize transition-all duration-200
                ${selectedRarity === rarity
                  ? `${getRarityColor(rarity)} text-white`
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }
              `}
            >
              {rarity}
            </button>
          ))}
        </div>
      </div>

      {/* Pieces Grid */}
      <div className="grid grid-cols-2 gap-3 overflow-y-auto max-h-96">
        {filteredPieces.map(piece => (
          <PieceCard
            key={piece.id}
            piece={piece}
            isPlaced={placedPieces.has(piece.id)}
          />
        ))}
      </div>

      {/* Summary */}
      <div className="mt-4 text-xs text-gray-400 text-center">
        {filteredPieces.length} pieces
        {selectedRarity !== 'all' && ` (${selectedRarity})`}
      </div>
    </div>
  );
};