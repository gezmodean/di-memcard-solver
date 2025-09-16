import type { Rarity } from '../types';

// Rarity-based starting stats and growth rates
export interface RarityConfig {
  baseAtk: number;
  baseHp: number;
  growthPerLevel: number; // Percentage growth per level (1-99)
  limitBreaks: {
    100: { atk: number; hp: number };
    120: { atk: number; hp: number };
    140: { atk: number; hp: number };
    160: { atk: number; hp: number };
    180: { atk: number; hp: number };
  };
}

// Game-accurate rarity configurations
export const RARITY_CONFIGS: Record<Rarity, RarityConfig> = {
  common: {
    baseAtk: 50,
    baseHp: 30,
    growthPerLevel: 0.5, // 0.5% per level
    limitBreaks: {
      100: { atk: 230, hp: 129 },     // 50 * 4.6 = 230, 30 * 4.3 = 129
      120: { atk: 595, hp: 333 },     // 50 * 11.9 = 595, 30 * 11.1 = 333
      140: { atk: 1540, hp: 861 },    // 50 * 30.8 = 1540, 30 * 28.7 = 861
      160: { atk: 3985, hp: 2229 },   // 50 * 79.7 = 3985, 30 * 74.3 = 2229
      180: { atk: 10310, hp: 5766 }   // 50 * 206.2 = 10310, 30 * 192.2 = 5766
    }
  },
  uncommon: {
    baseAtk: 75,
    baseHp: 45,
    growthPerLevel: 0.6,
    limitBreaks: {
      100: { atk: 345, hp: 194 },     // 75 * 4.6 = 345, 45 * 4.3 = 194
      120: { atk: 893, hp: 500 },     // 75 * 11.9 = 893, 45 * 11.1 = 500
      140: { atk: 2310, hp: 1292 },   // 75 * 30.8 = 2310, 45 * 28.7 = 1292
      160: { atk: 5978, hp: 3344 },   // 75 * 79.7 = 5978, 45 * 74.3 = 3344
      180: { atk: 15465, hp: 8649 }   // 75 * 206.2 = 15465, 45 * 192.2 = 8649
    }
  },
  rare: {
    baseAtk: 120,
    baseHp: 70,
    growthPerLevel: 0.7,
    limitBreaks: {
      100: { atk: 576, hp: 315 },     // 120 * 4.8 = 576, 70 * 4.5 = 315
      120: { atk: 1488, hp: 812 },    // 120 * 12.4 = 1488, 70 * 11.6 = 812
      140: { atk: 3852, hp: 2093 },   // 120 * 32.1 = 3852, 70 * 29.9 = 2093
      160: { atk: 9960, hp: 5418 },   // 120 * 83.0 = 9960, 70 * 77.4 = 5418
      180: { atk: 25776, hp: 14021 }  // 120 * 214.8 = 25776, 70 * 200.3 = 14021
    }
  },
  epic: {
    baseAtk: 200,
    baseHp: 120,
    growthPerLevel: 0.8,
    limitBreaks: {
      100: { atk: 1000, hp: 564 },    // 200 * 5.0 = 1000, 120 * 4.7 = 564
      120: { atk: 2580, hp: 1452 },   // 200 * 12.9 = 2580, 120 * 12.1 = 1452
      140: { atk: 6680, hp: 3744 },   // 200 * 33.4 = 6680, 120 * 31.2 = 3744
      160: { atk: 17280, hp: 9672 },  // 200 * 86.4 = 17280, 120 * 80.6 = 9672
      180: { atk: 44720, hp: 25032 }  // 200 * 223.6 = 44720, 120 * 208.6 = 25032
    }
  },
  legendary: {
    baseAtk: 350,
    baseHp: 200,
    growthPerLevel: 0.9,
    limitBreaks: {
      100: { atk: 1820, hp: 980 },    // 350 * 5.2 = 1820, 200 * 4.9 = 980
      120: { atk: 4725, hp: 2520 },   // 350 * 13.5 = 4725, 200 * 12.6 = 2520
      140: { atk: 12215, hp: 6520 },  // 350 * 34.9 = 12215, 200 * 32.6 = 6520
      160: { atk: 31605, hp: 16840 }, // 350 * 90.3 = 31605, 200 * 84.2 = 16840
      180: { atk: 81830, hp: 43620 }  // 350 * 233.8 = 81830, 200 * 218.1 = 43620
    }
  },
  mythic: {
    baseAtk: 522,
    baseHp: 261,
    growthPerLevel: 1.0,
    limitBreaks: {
      100: { atk: 2819, hp: 1331 },   // 522 * 5.4 = 2819, 261 * 5.1 = 1331
      120: { atk: 7308, hp: 3419 },   // 522 * 14.0 = 7308, 261 * 13.1 = 3419
      140: { atk: 18896, hp: 8820 },  // 522 * 36.2 = 18896, 261 * 33.8 = 8820
      160: { atk: 48911, hp: 22811 }, // 522 * 93.7 = 48911, 261 * 87.4 = 22811
      180: { atk: 126637, hp: 59085 } // 522 * 242.6 = 126637, 261 * 226.3 = 59085
    }
  },
  transcendent: {
    baseAtk: 1040,
    baseHp: 496,
    growthPerLevel: 1.2,
    limitBreaks: {
      100: { atk: 5824, hp: 2629 },   // 1040 * 5.6 = 5824, 496 * 5.3 = 2629
      120: { atk: 15080, hp: 6746 },  // 1040 * 14.5 = 15080, 496 * 13.6 = 6746
      140: { atk: 39104, hp: 17410 }, // 1040 * 37.6 = 39104, 496 * 35.1 = 17410
      160: { atk: 101192, hp: 45037 },// 1040 * 97.3 = 101192, 496 * 90.8 = 45037
      180: { atk: 262080, hp: 116560 }// 1040 * 252.0 = 262080, 496 * 235.0 = 116560
    }
  }
};

/**
 * Calculates stats for a piece based on rarity, level, and limit breaks
 * Uses live rarity configs from store if available, otherwise falls back to defaults
 */
export function calculateRarityBasedStats(rarity: Rarity, level: number, limitBreaks: number[] = [], customConfigs?: Record<Rarity, RarityConfig>): { atk: number; hp: number } {
  const configs = customConfigs || RARITY_CONFIGS;
  const config = configs[rarity];

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

  // Apply limit break static values based on achieved limit breaks
  const limitBreakLevels = [100, 120, 140, 160, 180] as const;

  for (const breakLevel of limitBreakLevels) {
    if (limitBreaks.includes(breakLevel) || level >= breakLevel) {
      const staticValues = config.limitBreaks[breakLevel];
      currentAtk = staticValues.atk;
      currentHp = staticValues.hp;
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