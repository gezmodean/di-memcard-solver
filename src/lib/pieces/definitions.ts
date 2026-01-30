import type { Piece, RarityConfig, Rarity, LevelTable } from '../types';
import { calculateRarityBasedStats } from './rarityProgression';

/**
 * Calculate stats from a static per-card level table.
 * Sums Atk_Pct_Bonus + Atk_Abs_Bonus → atk, Hp_Pct_Bonus + Hp_Abs_Bonus → hp.
 */
function calculateLevelTableStats(levelTable: LevelTable, level: number): { atk: number; hp: number } {
  const idx = Math.max(0, Math.min(level - 1, 199));
  let atk = 0;
  let hp = 0;

  for (const effect of levelTable.holdEffects) {
    const value = effect.values[idx] ?? 0;
    const et = effect.effectType;
    if (et === 'Atk_Pct_Bonus' || et === 'Atk_Abs_Bonus') {
      atk += value;
    } else if (et === 'Hp_Pct_Bonus' || et === 'Hp_Abs_Bonus') {
      hp += value;
    }
  }

  return { atk: Math.ceil(atk), hp: Math.ceil(hp) };
}

// Function will be called with optional rarity configs from store
export function calculatePieceStats(piece: Piece, rarityConfigs?: Record<Rarity, RarityConfig>): { atk: number; hp: number } {
  // Priority 1: Per-card level table (new static system from game data)
  if (piece.levelTable) {
    return calculateLevelTableStats(piece.levelTable, piece.level);
  }

  // Priority 2: Use custom stat growth if specified
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

  // Priority 3: Use rarity-based progression by default (unless explicitly disabled)
  if (piece.useRarityProgression !== false) {
    return calculateRarityBasedStats(piece.rarity, piece.level, piece.limitBreaks || [], rarityConfigs);
  }

  // Priority 4: Fallback to old simple 1% per level system
  const levelMultiplier = 1 + (piece.level - 1) * 0.01;
  return {
    atk: Math.floor(piece.baseStats.atk * levelMultiplier),
    hp: Math.floor(piece.baseStats.hp * levelMultiplier),
  };
}
