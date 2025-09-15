export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic' | 'transcendent';

export const RARITY_COLORS: Record<Rarity, string> = {
  common: '#868aaf',
  uncommon: '#ccac94',
  rare: '#35ff81',
  epic: '#448aff',
  legendary: '#fff35c',
  mythic: '#9b6bec',
  transcendent: '#ff38af',
};

export const RARITY_CELLS: Record<Rarity, number> = {
  common: 4,
  uncommon: 5,
  rare: 7,
  epic: 8,
  legendary: 9,
  mythic: 10,
  transcendent: 11,
};

export interface SpecialEffectVariable {
  name: string;
  value: number;
}

export interface SpecialEffect {
  description: string; // Template string like "skill cooldown decreases by {cooldown}"
  variables: SpecialEffectVariable[]; // Array of variables that can be substituted
  requiresOnField?: boolean; // Whether effect only applies when piece is on field (default true)
}

export interface StatGrowthConfig {
  type: 'percentage' | 'fixed';  // percentage = 1% per level, fixed = +N per level
  atkPerLevel?: number;         // For fixed type: how much ATK per level
  hpPerLevel?: number;          // For fixed type: how much HP per level
  percentagePerLevel?: number;  // For percentage type: default 1.0 (1% per level)
}

export interface Piece {
  id: string;
  name: string;
  rarity: Rarity;
  shape: number[][];  // 2D matrix, 1 = filled, 0 = empty
  color: string;
  icon: string;       // Emoji fallback
  iconFile?: string;  // Real game sprite file
  iconPosition?: { x: number; y: number }; // Position within the piece shape
  level: number;      // 1-200
  baseStats: {
    atk: number;
    hp: number;
  };
  limitBreaks?: number[]; // Array of achieved limit break levels [100, 120, 140, 160, 180]
  useRarityProgression?: boolean; // Whether to use rarity-based progression (default: true)
  statGrowth?: StatGrowthConfig; // Custom stat growth configuration (overrides rarity progression)
  specialEffects?: SpecialEffect[]; // Special effects that apply based on level
  unlocked: boolean;
}

export interface PlacedPiece {
  pieceId: string;
  x: number;         // top-left position on grid
  y: number;
  rotation: number;  // 0, 90, 180, 270 degrees
  shape: number[][]; // rotated shape
}

export interface GridState {
  cells: (string | null)[][];  // 9x9 grid, null = empty, string = piece ID
  placedPieces: Map<string, PlacedPiece>;
  selectedPieceId: string | null;
  hoveredPosition: { x: number; y: number } | null;
  conflicts: Set<string>;  // piece IDs that are conflicting
}

export interface Statistics {
  totalSolutions: number;
  pieceUsage: Record<string, number>;
  averageSolveTime: number;
  bestConfiguration: {
    atk: number;
    hp: number;
    pieces: string[];
  };
}

export interface Solution {
  id: string;
  pieces: PlacedPiece[];
  totalStats: {
    atk: number;
    hp: number;
  };
  timestamp: number;
}