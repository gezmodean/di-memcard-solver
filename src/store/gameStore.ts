import { create } from 'zustand';
import type { PlacedPiece, Piece, Rarity, RarityConfig, PieceDefinition, SiteConfig, PlayerData } from '../lib/types';
import { calculatePieceStats } from '../lib/pieces/definitions';
import { rotateShape } from '../lib/utils/rotation';
import { RARITY_COLORS } from '../lib/types';
import { RARITY_CONFIGS } from '../lib/pieces/rarityProgression';

// Bump this version to force all users to reload pieces.json on next visit
const SITE_CONFIG_VERSION = 2;
const SITE_CONFIG_VERSION_KEY = 'memsolver-site-config-version';

interface GameStore {
  // Grid state
  grid: (string | null)[][];
  placedPieces: Map<string, PlacedPiece>;
  selectedPieceId: string | null;
  hoveredPosition: { x: number; y: number } | null;
  conflicts: Set<string>;

  // Site configuration (admin/editor data)
  siteConfig: SiteConfig;
  siteConfigLoaded: boolean;

  // Player data (user progress)
  playerData: PlayerData;
  playerDataLoaded: boolean;

  // Combined runtime pieces
  pieces: Piece[];
  piecesLoaded: boolean;

  // Backward compatibility
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

  // Site configuration management
  loadSiteConfig: () => Promise<void>;
  saveSiteConfig: () => void;
  exportSiteConfig: () => void;
  importSiteConfig: (config: SiteConfig) => void;
  resetToOriginalSiteConfig: () => Promise<void>;
  updatePieceDefinition: (pieceDefinition: PieceDefinition) => void;
  addPieceDefinition: (pieceDefinition: PieceDefinition) => void;
  removePieceDefinition: (pieceId: string) => void;

  // Player data management
  loadPlayerData: () => void;
  savePlayerData: () => void;
  exportPlayerData: () => void;
  importPlayerData: (data: PlayerData) => void;
  resetPlayerData: () => void;
  unlockAllPieces: () => void;

  // Combined data management
  combinePieceData: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  grid: Array(9).fill(null).map(() => Array(9).fill(null)),
  placedPieces: new Map(),
  selectedPieceId: null,
  hoveredPosition: null,
  conflicts: new Set(),
  siteConfig: {
    pieces: [],
    rarityConfigs: { ...RARITY_CONFIGS }
  },
  siteConfigLoaded: false,
  playerData: {
    pieces: []
  },
  playerDataLoaded: false,
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
    const state = get();

    // Load rarity configs first
    state.loadRarityConfigs();

    // Load site config and player data if not already loaded
    if (!state.siteConfigLoaded) {
      await state.loadSiteConfig();
    }
    if (!state.playerDataLoaded) {
      state.loadPlayerData();
    }

    // Combine the data
    state.combinePieceData();
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

  // Site configuration management
  loadSiteConfig: async () => {
    try {
      const storedVersion = parseInt(localStorage.getItem(SITE_CONFIG_VERSION_KEY) || '0', 10);
      const stored = localStorage.getItem('memsolver-site-config');

      if (stored && storedVersion >= SITE_CONFIG_VERSION) {
        const config = JSON.parse(stored);
        set({ siteConfig: config, siteConfigLoaded: true });
        return;
      }

      // Version mismatch or no stored config — reload from public/pieces.json
      if (stored && storedVersion < SITE_CONFIG_VERSION) {
        localStorage.removeItem('memsolver-site-config');
      }
      const response = await fetch(`${import.meta.env.BASE_URL}pieces.json`);
      if (!response.ok) {
        throw new Error('Failed to fetch pieces.json');
      }
      const data = await response.json();
      const loadedPieces = data.pieces || data;

      const siteConfig: SiteConfig = {
        pieces: loadedPieces.map((piece: any) => ({
          id: piece.id,
          name: piece.name,
          rarity: piece.rarity,
          shape: piece.shape,
          color: piece.color || RARITY_COLORS[piece.rarity as Rarity],
          icon: piece.icon,
          iconFile: piece.iconFile,
          baseStats: piece.baseStats,
          useRarityProgression: piece.useRarityProgression,
          statGrowth: piece.statGrowth,
          specialEffects: piece.specialEffects
        })),
        rarityConfigs: { ...RARITY_CONFIGS }
      };

      set({ siteConfig, siteConfigLoaded: true });
      localStorage.setItem('memsolver-site-config', JSON.stringify(siteConfig));
      localStorage.setItem(SITE_CONFIG_VERSION_KEY, String(SITE_CONFIG_VERSION));
    } catch (error) {
      console.error('Error loading site config:', error);
      set({
        siteConfig: { pieces: [], rarityConfigs: { ...RARITY_CONFIGS } },
        siteConfigLoaded: true
      });
    }
  },

  saveSiteConfig: () => {
    const state = get();
    localStorage.setItem('memsolver-site-config', JSON.stringify(state.siteConfig));
    localStorage.setItem(SITE_CONFIG_VERSION_KEY, String(SITE_CONFIG_VERSION));
  },

  exportSiteConfig: () => {
    const state = get();
    const dataStr = JSON.stringify(state.siteConfig, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `site-config-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  importSiteConfig: (config: SiteConfig) => {
    set({ siteConfig: config });
    get().saveSiteConfig();
    get().combinePieceData();
  },

  resetToOriginalSiteConfig: async () => {
    localStorage.removeItem('memsolver-site-config');
    await get().loadSiteConfig();
    get().combinePieceData();
  },

  updatePieceDefinition: (pieceDefinition: PieceDefinition) => {
    const state = get();
    const newPieces = state.siteConfig.pieces.map(p =>
      p.id === pieceDefinition.id ? pieceDefinition : p
    );
    const newSiteConfig = { ...state.siteConfig, pieces: newPieces };
    set({ siteConfig: newSiteConfig });
    get().saveSiteConfig();
    get().combinePieceData();
  },

  addPieceDefinition: (pieceDefinition: PieceDefinition) => {
    const state = get();
    // Prevent duplicate IDs
    if (state.siteConfig.pieces.some(p => p.id === pieceDefinition.id)) {
      console.warn(`Piece with id "${pieceDefinition.id}" already exists, skipping add.`);
      return;
    }
    const newSiteConfig = {
      ...state.siteConfig,
      pieces: [...state.siteConfig.pieces, pieceDefinition]
    };
    set({ siteConfig: newSiteConfig });
    get().saveSiteConfig();
    get().combinePieceData();
  },

  removePieceDefinition: (pieceId: string) => {
    const state = get();
    const newPieces = state.siteConfig.pieces.filter(p => p.id !== pieceId);
    const newSiteConfig = { ...state.siteConfig, pieces: newPieces };
    set({ siteConfig: newSiteConfig });
    get().saveSiteConfig();
    get().combinePieceData();
  },

  // Player data management
  loadPlayerData: () => {
    try {
      const stored = localStorage.getItem('memsolver-player-data');
      if (stored) {
        const data = JSON.parse(stored);
        set({ playerData: data, playerDataLoaded: true });
      } else {
        set({ playerData: { pieces: [] }, playerDataLoaded: true });
      }
    } catch (error) {
      console.error('Error loading player data:', error);
      set({ playerData: { pieces: [] }, playerDataLoaded: true });
    }
  },

  savePlayerData: () => {
    const state = get();
    localStorage.setItem('memsolver-player-data', JSON.stringify(state.playerData));
  },

  exportPlayerData: () => {
    const state = get();
    const dataStr = JSON.stringify(state.playerData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `my-memory-cards-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  importPlayerData: (data: PlayerData) => {
    set({ playerData: data });
    get().savePlayerData();
    get().combinePieceData();
  },

  resetPlayerData: () => {
    const playerData = { pieces: [] };
    set({ playerData, playerDataLoaded: true });
    localStorage.removeItem('memsolver-player-data');
    get().combinePieceData();
  },

  unlockAllPieces: () => {
    const state = get();
    const newPlayerPieces = state.siteConfig.pieces.map(sitePiece => {
      const existingPlayerPiece = state.playerData.pieces.find(p => p.id === sitePiece.id);
      return {
        id: sitePiece.id,
        level: existingPlayerPiece?.level || 1,
        limitBreaks: existingPlayerPiece?.limitBreaks || [],
        unlocked: true
      };
    });
    const newPlayerData = { pieces: newPlayerPieces };
    set({ playerData: newPlayerData });
    get().savePlayerData();
    get().combinePieceData();
  },

  // Combined data management
  combinePieceData: () => {
    const state = get();
    const combinedPieces: Piece[] = state.siteConfig.pieces.map(sitePiece => {
      const playerPiece = state.playerData.pieces.find(p => p.id === sitePiece.id);
      return {
        ...sitePiece,
        level: playerPiece?.level || 1,
        limitBreaks: playerPiece?.limitBreaks || [],
        unlocked: playerPiece?.unlocked || false
      };
    });
    set({ pieces: combinedPieces, piecesLoaded: true });
  },
}));