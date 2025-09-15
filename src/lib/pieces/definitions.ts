import type { Piece } from '../types';
import { calculateRarityBasedStats } from './rarityProgression';

export function calculatePieceStats(piece: Piece): { atk: number; hp: number } {
  // Use custom stat growth if specified
  if (piece.statGrowth) {
    const statGrowth = piece.statGrowth;

    if (statGrowth.type === 'percentage') {
      // Percentage-based growth
      const percentPerLevel = statGrowth.percentagePerLevel || 1.0;
      const levelMultiplier = 1 + (piece.level - 1) * (percentPerLevel / 100);
      return {
        atk: Math.floor(piece.baseStats.atk * levelMultiplier),
        hp: Math.floor(piece.baseStats.hp * levelMultiplier),
      };
    } else {
      // Fixed growth per level
      const atkPerLevel = statGrowth.atkPerLevel || 0;
      const hpPerLevel = statGrowth.hpPerLevel || 0;
      return {
        atk: piece.baseStats.atk + (piece.level - 1) * atkPerLevel,
        hp: piece.baseStats.hp + (piece.level - 1) * hpPerLevel,
      };
    }
  }

  // Use rarity-based progression by default (unless explicitly disabled)
  if (piece.useRarityProgression !== false) {
    return calculateRarityBasedStats(piece.rarity, piece.level, piece.limitBreaks || []);
  }

  // Fallback to old simple 1% per level system
  const levelMultiplier = 1 + (piece.level - 1) * 0.01;
  return {
    atk: Math.floor(piece.baseStats.atk * levelMultiplier),
    hp: Math.floor(piece.baseStats.hp * levelMultiplier),
  };
}