import type { Rarity } from '../types';

// Rarity-based starting stats and growth rates
export interface RarityConfig {
  baseAtk: number;
  baseHp: number;
  growthPerLevel: number; // Percentage growth per level (1-99)
  limitBreaks: {
    100: { atkMultiplier: number; hpMultiplier: number };
    120: { atkMultiplier: number; hpMultiplier: number };
    140: { atkMultiplier: number; hpMultiplier: number };
    160: { atkMultiplier: number; hpMultiplier: number };
    180: { atkMultiplier: number; hpMultiplier: number };
  };
}

// Game-accurate rarity configurations
export const RARITY_CONFIGS: Record<Rarity, RarityConfig> = {
  common: {
    baseAtk: 50,
    baseHp: 30,
    growthPerLevel: 0.5, // 0.5% per level
    limitBreaks: {
      100: { atkMultiplier: 4.6, hpMultiplier: 4.3 },
      120: { atkMultiplier: 11.9, hpMultiplier: 11.1 },
      140: { atkMultiplier: 30.8, hpMultiplier: 28.7 },
      160: { atkMultiplier: 79.7, hpMultiplier: 74.3 },
      180: { atkMultiplier: 206.2, hpMultiplier: 192.2 }
    }
  },
  uncommon: {
    baseAtk: 75,
    baseHp: 45,
    growthPerLevel: 0.6,
    limitBreaks: {
      100: { atkMultiplier: 4.6, hpMultiplier: 4.3 }, // 106A% example from user
      120: { atkMultiplier: 11.9, hpMultiplier: 11.1 }, // 273A% example from user
      140: { atkMultiplier: 30.8, hpMultiplier: 28.7 },
      160: { atkMultiplier: 79.7, hpMultiplier: 74.3 },
      180: { atkMultiplier: 206.2, hpMultiplier: 192.2 }
    }
  },
  rare: {
    baseAtk: 120,
    baseHp: 70,
    growthPerLevel: 0.7,
    limitBreaks: {
      100: { atkMultiplier: 4.8, hpMultiplier: 4.5 },
      120: { atkMultiplier: 12.4, hpMultiplier: 11.6 },
      140: { atkMultiplier: 32.1, hpMultiplier: 29.9 },
      160: { atkMultiplier: 83.0, hpMultiplier: 77.4 },
      180: { atkMultiplier: 214.8, hpMultiplier: 200.3 }
    }
  },
  epic: {
    baseAtk: 200,
    baseHp: 120,
    growthPerLevel: 0.8,
    limitBreaks: {
      100: { atkMultiplier: 5.0, hpMultiplier: 4.7 },
      120: { atkMultiplier: 12.9, hpMultiplier: 12.1 },
      140: { atkMultiplier: 33.4, hpMultiplier: 31.2 },
      160: { atkMultiplier: 86.4, hpMultiplier: 80.6 },
      180: { atkMultiplier: 223.6, hpMultiplier: 208.6 }
    }
  },
  legendary: {
    baseAtk: 350,
    baseHp: 200,
    growthPerLevel: 0.9,
    limitBreaks: {
      100: { atkMultiplier: 5.2, hpMultiplier: 4.9 },
      120: { atkMultiplier: 13.5, hpMultiplier: 12.6 },
      140: { atkMultiplier: 34.9, hpMultiplier: 32.6 },
      160: { atkMultiplier: 90.3, hpMultiplier: 84.2 },
      180: { atkMultiplier: 233.8, hpMultiplier: 218.1 }
    }
  },
  mythic: {
    baseAtk: 522,
    baseHp: 261,
    growthPerLevel: 1.0,
    limitBreaks: {
      100: { atkMultiplier: 5.4, hpMultiplier: 5.1 },
      120: { atkMultiplier: 14.0, hpMultiplier: 13.1 },
      140: { atkMultiplier: 36.2, hpMultiplier: 33.8 },
      160: { atkMultiplier: 93.7, hpMultiplier: 87.4 },
      180: { atkMultiplier: 242.6, hpMultiplier: 226.3 }
    }
  },
  transcendent: {
    baseAtk: 1040,
    baseHp: 496,
    growthPerLevel: 1.2,
    limitBreaks: {
      100: { atkMultiplier: 5.6, hpMultiplier: 5.3 },
      120: { atkMultiplier: 14.5, hpMultiplier: 13.6 },
      140: { atkMultiplier: 37.6, hpMultiplier: 35.1 },
      160: { atkMultiplier: 97.3, hpMultiplier: 90.8 },
      180: { atkMultiplier: 252.0, hpMultiplier: 235.0 }
    }
  }
};

/**
 * Calculates stats for a piece based on rarity, level, and limit breaks
 */
export function calculateRarityBasedStats(rarity: Rarity, level: number, limitBreaks: number[] = []): { atk: number; hp: number } {
  const config = RARITY_CONFIGS[rarity];

  if (level <= 99) {
    // Standard progression (levels 1-99)
    const growthMultiplier = 1 + ((level - 1) * config.growthPerLevel / 100);
    return {
      atk: Math.floor(config.baseAtk * growthMultiplier),
      hp: Math.floor(config.baseHp * growthMultiplier)
    };
  }

  // Level 100+ logic - stats only increase at limit break milestones
  let currentAtk = config.baseAtk;
  let currentHp = config.baseHp;

  // Apply growth up to level 99
  const level99Multiplier = 1 + (98 * config.growthPerLevel / 100);
  currentAtk *= level99Multiplier;
  currentHp *= level99Multiplier;

  // Apply limit break multipliers based on achieved limit breaks
  const limitBreakLevels = [100, 120, 140, 160, 180] as const;

  for (const breakLevel of limitBreakLevels) {
    if (limitBreaks.includes(breakLevel) || level >= breakLevel) {
      const multipliers = config.limitBreaks[breakLevel];
      currentAtk = config.baseAtk * multipliers.atkMultiplier;
      currentHp = config.baseHp * multipliers.hpMultiplier;
    }

    // Stop at the current level's limit break
    if (level >= breakLevel && level < (limitBreakLevels[limitBreakLevels.indexOf(breakLevel) + 1] || 201)) {
      break;
    }
  }

  return {
    atk: Math.floor(currentAtk),
    hp: Math.floor(currentHp)
  };
}

/**
 * Gets the maximum level for a piece based on limit breaks achieved
 */
export function getMaxLevel(limitBreaks: number[]): number {
  if (limitBreaks.includes(180)) return 200;
  if (limitBreaks.includes(160)) return 180;
  if (limitBreaks.includes(140)) return 160;
  if (limitBreaks.includes(120)) return 140;
  if (limitBreaks.includes(100)) return 120;
  return 100;
}

/**
 * Gets the next limit break level for a piece
 */
export function getNextLimitBreak(level: number, limitBreaks: number[]): number | null {
  const breakLevels = [100, 120, 140, 160, 180];

  for (const breakLevel of breakLevels) {
    if (level >= breakLevel && !limitBreaks.includes(breakLevel)) {
      return breakLevel;
    }
  }

  return null;
}

/**
 * Checks if a level is a limit break milestone
 */
export function isLimitBreakLevel(level: number): boolean {
  return [100, 120, 140, 160, 180].includes(level);
}

/**
 * Gets the preview stats for what would happen at the next limit break
 */
export function getNextLimitBreakPreview(rarity: Rarity, level: number, limitBreaks: number[]): { atk: number; hp: number; breakLevel: number } | null {
  const nextBreak = getNextLimitBreak(level, limitBreaks);
  if (!nextBreak) return null;

  const previewStats = calculateRarityBasedStats(rarity, nextBreak, [...limitBreaks, nextBreak]);
  return {
    atk: previewStats.atk,
    hp: previewStats.hp,
    breakLevel: nextBreak
  };
}