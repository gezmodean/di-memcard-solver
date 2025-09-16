import { create } from 'zustand';
import type { PlacedPiece, Piece, Rarity, RarityConfig } from '../lib/types';
import { calculatePieceStats } from '../lib/pieces/definitions';
import { rotateShape } from '../lib/utils/rotation';
import { RARITY_COLORS } from '../lib/types';
import { RARITY_CONFIGS } from '../lib/pieces/rarityProgression';

interface GameStore {
  // Grid state
  grid: (string | null)[][];
  placedPieces: Map<string, PlacedPiece>;
  selectedPieceId: string | null;
  hoveredPosition: { x: number; y: number } | null;
  conflicts: Set<string>;

  // Pieces
  pieces: Piece[];
  piecesLoaded: boolean;

  // Rarity configurations
  rarityConfigs: Record<Rarity, RarityConfig>;

  // Actions
  initializeGrid: () => void;
  loadPieces: () => Promise<void>;
  savePiecesToStorage: () => void;
  resetPiecesToOriginal: () => Promise<void>;
  savePiecesToJSON: () => Promise<void>;
  placePiece: (pieceId: string, x: number, y: number, rotation: number) => boolean;
  removePiece: (pieceId: string) => void;
  rotatePiece: (pieceId: string) => void;
  selectPiece: (pieceId: string | null) => void;
  setHoveredPosition: (position: { x: number; y: number } | null) => void;
  checkConflicts: () => void;
  clearGrid: () => void;
  updatePieceLevel: (pieceId: string, level: number) => void;
  updatePieceData: (pieceData: Piece) => void;
  addNewPieces: (newPieces: Piece[]) => void;
  togglePieceLock: (pieceId: string) => void;
  getTotalStats: () => { atk: number; hp: number };
  updateRarityConfig: (rarity: Rarity, config: RarityConfig) => void;
  saveRarityConfigs: () => void;
  loadRarityConfigs: () => void;
  resetRarityConfigs: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  grid: Array(9).fill(null).map(() => Array(9).fill(null)),
  placedPieces: new Map(),
  selectedPieceId: null,
  hoveredPosition: null,
  conflicts: new Set(),
  pieces: [],
  piecesLoaded: false,
  rarityConfigs: { ...RARITY_CONFIGS },

  initializeGrid: () => {
    set({
      grid: Array(9).fill(null).map(() => Array(9).fill(null)),
      placedPieces: new Map(),
      conflicts: new Set(),
    });
  },

  loadPieces: async () => {
    // Load rarity configs first
    get().loadRarityConfigs();

    try {
      // Try to load from localStorage first
      const storedPieces = localStorage.getItem('memsolver-pieces');
      if (storedPieces) {
        const parsedPieces = JSON.parse(storedPieces);
        const piecesWithColors = parsedPieces.map((piece: unknown) => {
          const p = piece as Record<string, unknown>;
          return {
            ...p,
            color: RARITY_COLORS[p.rarity as Rarity] || RARITY_COLORS.common,
            icon: p.icon || '🎮',
            unlocked: p.unlocked ?? false // Default to locked if not specified
          };
        }) as Piece[];
        set({ pieces: piecesWithColors, piecesLoaded: true });
        return;
      }

      // Fallback to loading from public/pieces.json (initial load only)
      const response = await fetch('/pieces.json');
      if (!response.ok) {
        throw new Error('Failed to fetch pieces.json');
      }
      const data = await response.json();
      const loadedPieces = data.pieces || data;

      // Add color property based on rarity when loading pieces
      const piecesWithColors = (Array.isArray(loadedPieces) ? loadedPieces : []).map((piece: unknown) => {
        const p = piece as Record<string, unknown>;
        return {
          ...p,
          color: RARITY_COLORS[p.rarity as Rarity] || RARITY_COLORS.common,
          icon: p.icon || '🎮', // Fallback emoji
          unlocked: p.unlocked ?? false // Default to locked if not specified
        };
      }) as Piece[];

      // Save to localStorage for future use
      localStorage.setItem('memsolver-pieces', JSON.stringify(piecesWithColors));
      set({ pieces: piecesWithColors, piecesLoaded: true });
    } catch (error) {
      console.error('Error loading pieces:', error);
      set({ pieces: [], piecesLoaded: true });
    }
  },

  savePiecesToStorage: () => {
    const state = get();
    localStorage.setItem('memsolver-pieces', JSON.stringify(state.pieces));
  },

  resetPiecesToOriginal: async () => {
    // Clear localStorage to force reload from public/pieces.json
    localStorage.removeItem('memsolver-pieces');
    // Reload pieces from the original file
    await get().loadPieces();
  },

  savePiecesToJSON: async () => {
    const state = get();
    const dataStr = JSON.stringify({ pieces: state.pieces }, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pieces.json';
    a.click();
    URL.revokeObjectURL(url);
  },

  placePiece: (pieceId: string, x: number, y: number, rotation: number) => {
    const state = get();
    const piece = state.pieces.find(p => p.id === pieceId);
    if (!piece || !piece.unlocked) return false;

    // Check if piece is already placed
    if (state.placedPieces.has(pieceId)) {
      state.removePiece(pieceId);
    }

    const rotatedShape = rotateShape(piece.shape, rotation);
    const newGrid = state.grid.map(row => [...row]);

    // Check if placement is valid
    for (let i = 0; i < rotatedShape.length; i++) {
      for (let j = 0; j < rotatedShape[i].length; j++) {
        if (rotatedShape[i][j] === 1) {
          const gridY = y + i;
          const gridX = x + j;

          if (gridX < 0 || gridX >= 9 || gridY < 0 || gridY >= 9) {
            return false; // Out of bounds
          }

          if (newGrid[gridY][gridX] !== null && newGrid[gridY][gridX] !== pieceId) {
            return false; // Cell already occupied by another piece
          }
        }
      }
    }

    // Place the piece
    for (let i = 0; i < rotatedShape.length; i++) {
      for (let j = 0; j < rotatedShape[i].length; j++) {
        if (rotatedShape[i][j] === 1) {
          newGrid[y + i][x + j] = pieceId;
        }
      }
    }

    const newPlacedPieces = new Map(state.placedPieces);
    newPlacedPieces.set(pieceId, { pieceId, x, y, rotation, shape: rotatedShape });

    set({
      grid: newGrid,
      placedPieces: newPlacedPieces,
    });

    get().checkConflicts();
    return true;
  },

  removePiece: (pieceId: string) => {
    const state = get();
    const placedPiece = state.placedPieces.get(pieceId);
    if (!placedPiece) return;

    const newGrid = state.grid.map(row =>
      row.map(cell => cell === pieceId ? null : cell)
    );

    const newPlacedPieces = new Map(state.placedPieces);
    newPlacedPieces.delete(pieceId);

    set({
      grid: newGrid,
      placedPieces: newPlacedPieces,
    });

    get().checkConflicts();
  },

  rotatePiece: (pieceId: string) => {
    const state = get();
    const placedPiece = state.placedPieces.get(pieceId);
    if (!placedPiece) return;

    const newRotation = (placedPiece.rotation + 90) % 360;
    state.removePiece(pieceId);
    state.placePiece(pieceId, placedPiece.x, placedPiece.y, newRotation);
  },

  selectPiece: (pieceId: string | null) => {
    set({ selectedPieceId: pieceId });
  },

  setHoveredPosition: (position: { x: number; y: number } | null) => {
    set({ hoveredPosition: position });
  },

  checkConflicts: () => {
    const state = get();
    const conflictingPieces = new Set<string>();
    const cellOccupancy = new Map<string, string[]>();

    // Build cell occupancy map
    for (let y = 0; y < 9; y++) {
      for (let x = 0; x < 9; x++) {
        const pieceId = state.grid[y][x];
        if (pieceId) {
          const key = `${x},${y}`;
          if (!cellOccupancy.has(key)) {
            cellOccupancy.set(key, []);
          }
          cellOccupancy.get(key)!.push(pieceId);
        }
      }
    }

    // Find conflicts
    cellOccupancy.forEach((pieces) => {
      if (pieces.length > 1) {
        pieces.forEach(p => conflictingPieces.add(p));
      }
    });

    set({ conflicts: conflictingPieces });
  },

  clearGrid: () => {
    get().initializeGrid();
  },

  updatePieceLevel: (pieceId: string, level: number) => {
    const state = get();
    const newPieces = state.pieces.map(p =>
      p.id === pieceId ? { ...p, level: Math.min(200, Math.max(1, level)) } : p
    );
    set({ pieces: newPieces });
    get().savePiecesToStorage();
  },

  updatePieceData: (pieceData: Piece) => {
    const state = get();
    const newPieces = state.pieces.map(p =>
      p.id === pieceData.id ? { ...pieceData } : p
    );
    set({ pieces: newPieces });
    get().savePiecesToStorage();

    // If the piece is currently placed, re-place it to update the grid
    const placedPiece = state.placedPieces.get(pieceData.id);
    if (placedPiece) {
      get().removePiece(pieceData.id);
      setTimeout(() => {
        get().placePiece(pieceData.id, placedPiece.x, placedPiece.y, placedPiece.rotation);
      }, 10);
    }
  },

  addNewPieces: (newPieces: Piece[]) => {
    const state = get();
    // Ensure new pieces default to locked if not specified
    const piecesWithDefaults = newPieces.map(piece => ({
      ...piece,
      unlocked: piece.unlocked ?? false
    }));
    const updatedPieces = [...state.pieces, ...piecesWithDefaults];
    set({ pieces: updatedPieces });
    get().savePiecesToStorage();
  },

  togglePieceLock: (pieceId: string) => {
    const state = get();
    const newPieces = state.pieces.map(p =>
      p.id === pieceId ? { ...p, unlocked: !p.unlocked } : p
    );
    set({ pieces: newPieces });
    get().savePiecesToStorage();
  },

  getTotalStats: () => {
    const state = get();
    let totalAtk = 0;
    let totalHp = 0;

    // Calculate total from ALL owned pieces, not just placed ones
    state.pieces.forEach((piece) => {
      const stats = calculatePieceStats(piece, state.rarityConfigs);
      totalAtk += stats.atk;
      totalHp += stats.hp;
    });

    return { atk: totalAtk, hp: totalHp };
  },

  updateRarityConfig: (rarity: Rarity, config: RarityConfig) => {
    const state = get();
    const newConfigs = {
      ...state.rarityConfigs,
      [rarity]: config
    };
    set({ rarityConfigs: newConfigs });
    get().saveRarityConfigs();
  },

  saveRarityConfigs: () => {
    const state = get();
    localStorage.setItem('memsolver-rarity-configs', JSON.stringify(state.rarityConfigs));
  },

  loadRarityConfigs: () => {
    try {
      const stored = localStorage.getItem('memsolver-rarity-configs');
      if (stored) {
        const configs = JSON.parse(stored);
        set({ rarityConfigs: configs });
      }
    } catch (error) {
      console.error('Error loading rarity configs:', error);
      // Reset to defaults on error
      set({ rarityConfigs: { ...RARITY_CONFIGS } });
    }
  },

  resetRarityConfigs: () => {
    set({ rarityConfigs: { ...RARITY_CONFIGS } });
    localStorage.removeItem('memsolver-rarity-configs');
  },
}));