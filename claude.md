# Claude.md - Memory Card Grid Solver

## Project Overview
This is a sophisticated React TypeScript web application for optimizing memory card placement on a 9×9 grid for the game Darkstar Idle. It helps players find optimal configurations for memory cards by automatically solving placement puzzles and managing card inventories with complex stats, shapes, and special effects.

## Key Technologies
- **React 19** with TypeScript
- **Vite** for development and build tooling
- **Tailwind CSS** for styling
- **Zustand** for state management
- **ESLint** for code quality

## Development Commands
```bash
# Development
npm run dev          # Start development server
npm run start        # Alternative start command

# Building
npm run build        # TypeScript compilation + Vite build
npm run serve        # Preview production build
npm run preview      # Alternative preview command

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Run ESLint with auto-fix
npm run type-check   # TypeScript type checking

# Maintenance
npm run clean        # Clean build artifacts
npm run install:clean # Clean install
```

## Project Structure
```
src/
├── components/
│   ├── DataInput/          # Card data input and editing
│   ├── Grid/              # 9×9 grid visualization
│   ├── PieceEditor/       # Card property editor
│   ├── PieceSelector/     # Card inventory and selection
│   ├── Solver/            # Auto-solver components
│   ├── Statistics/        # Stats and effects panels
│   └── UI/                # Reusable UI components
├── lib/
│   ├── pieces/            # Card definitions and rarity system
│   ├── solver/            # Grid solving algorithms
│   ├── types.ts           # TypeScript type definitions
│   └── utils/             # Utility functions
├── store/
│   └── gameStore.ts       # Zustand state management
├── assets/
│   └── icons/             # Card icon sprites
└── data/
    └── realPieces.json    # Card configuration data
```

## Key Features
- Interactive 9×9 grid with real-time conflict detection
- Smart auto-solver for optimal card placement
- Seven-tier rarity system (Common → Transcendent)
- Comprehensive card management with levels and stats
- Shape visualization and complex card shapes
- Special effects system with conditional activation
- Export/import functionality for configurations
- Advanced card editor with limit break system

## Important Files
- `src/store/gameStore.ts` - Main application state
- `src/lib/types.ts` - Core type definitions
- `src/lib/solver/backtrack.ts` - Grid solving algorithm
- `src/lib/pieces/rarityProgression.ts` - Card rarity and stats system
- `src/data/realPieces.json` - Card configuration data

## Development Notes
- Uses React 19 with modern hooks for optimal performance
- Efficient state management with Zustand
- Complex grid solving using backtracking algorithm
- Seven-tier rarity system with unique progression curves
- Limit break system at levels 100, 120, 140, 160, and 180
- Icon system using sprite-based assets

## Testing & Quality
- ESLint configuration for code quality
- TypeScript for type safety
- Vite for fast development and optimized builds