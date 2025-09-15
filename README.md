# Memory Card Grid Solver

A sophisticated web application for optimizing memory card placement on a 9×9 grid. Designed to help players find optimal configurations for memory card games by automatically solving placement puzzles and managing card inventories with complex stats, shapes, and special effects.

![Memory Card Grid Solver](./docs/screenshot.png)

## Features

- **Interactive 9×9 Grid**: Visual placement of memory cards with real-time conflict detection
- **Smart Auto Solver**: Automatically finds optimal placements for selected memory cards
- **Memory Card Management**: Comprehensive inventory system with card levels, stats, and special effects
- **Rarity System**: Seven-tier rarity system (Common → Transcendent) with unique progression curves
- **Shape Visualization**: Accurate preview of complex card shapes before placement
- **Statistics Tracking**: Real-time calculation of total collection power and individual card stats
- **Card Editor**: Advanced editing capabilities for card properties, stats, and limit breaks
- **Special Effects**: Support for conditional effects that activate based on placement
- **Export/Import**: Save and load card configurations as JSON files

## Getting Started

### Prerequisites

Before running the application, make sure you have:

- **Node.js** (version 18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**

### Installation

1. **Clone or download** the repository to your local machine
2. **Navigate to the project directory**:
   ```bash
   cd memsolver-app
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser** and navigate to `http://localhost:5173` (or the port shown in your terminal)

### Building for Production

To create a production build:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

## How to Use

### Basic Usage

1. **Select Memory Cards**: Click on cards in the left inventory to add them to your queue
2. **Use Auto Solver**: Click "Find Any Solution" to automatically place selected cards optimally
3. **Manual Placement**: Click on grid cells to manually place your selected card
4. **View Details**: Right-click any card to see detailed stats, shape, and special effects

### Card Management

- **Level Cards**: Use the + and - buttons to adjust card levels
- **View Stats**: Right-click cards to see detailed statistics and shape previews
- **Special Effects**: Check which effects are active based on your current setup

### Advanced Features

- **Settings Panel**: Access the gear icon to edit card properties, stats, and configurations
- **Export/Import**: Use "Save Config" to export your card setup, or import existing configurations
- **Alternative Solutions**: The solver can find multiple placement solutions for the same card set

## Card Data Structure

Cards are defined in `public/pieces.json` with the following structure:

```json
{
  "id": "piece_1",
  "name": "Card Name",
  "rarity": "legendary",
  "shape": [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 1]
  ],
  "iconFile": "card-icon.png",
  "level": 1,
  "baseStats": { "atk": 350, "hp": 200 },
  "unlocked": true,
  "specialEffects": [...]
}
```

### Rarity Progression

The game features seven rarity tiers with unique base stats and growth curves:

- **Common**: 50 ATK, 30 HP (0.5% growth per level)
- **Uncommon**: 75 ATK, 45 HP (0.6% growth per level)
- **Rare**: 120 ATK, 70 HP (0.7% growth per level)
- **Epic**: 200 ATK, 120 HP (0.8% growth per level)
- **Legendary**: 350 ATK, 200 HP (0.9% growth per level)
- **Mythic**: 600 ATK, 350 HP (1.0% growth per level)
- **Transcendent**: 1000 ATK, 600 HP (1.2% growth per level)

### Limit Break System

Cards can be limit broken at levels 100, 120, 140, 160, and 180, with significant stat multipliers at each milestone.

## Technical Details

### Built With

- **React 19** - UI framework
- **TypeScript** - Type safety and development experience
- **Vite** - Fast development build tool
- **Tailwind CSS** - Utility-first CSS framework
- **Zustand** - Lightweight state management
- **ESLint** - Code linting and quality

### Project Structure

```
memsolver-app/
├── public/
│   ├── pieces.json          # Card definitions
│   └── icons/              # Card icon images
├── src/
│   ├── components/         # React components
│   ├── lib/               # Utilities and game logic
│   ├── store/             # State management
│   └── App.tsx            # Main application
├── package.json
└── README.md
```

### Performance Considerations

- Uses React 19 with modern hooks for optimal performance
- Efficient state management with Zustand
- Optimized grid rendering for smooth interactions
- Lazy loading of card icons and assets

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Adding New Cards

1. Add card data to `public/pieces.json`
2. Place card icon in `public/icons/`
3. Restart the development server

### Customizing Rarities

Edit base stats and progression in `src/lib/pieces/rarityProgression.ts`:

```typescript
export const RARITY_CONFIGS: Record<Rarity, RarityConfig> = {
  legendary: {
    baseAtk: 350,
    baseHp: 200,
    growthPerLevel: 0.9,
    // ... limit break multipliers
  }
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

If you encounter any issues or have questions:

1. Check the troubleshooting section below
2. Review existing issues in the repository
3. Create a new issue with detailed information

### Troubleshooting

**Cards not loading**: Ensure `pieces.json` is valid JSON and properly formatted
**Icons not displaying**: Check that icon files exist in `public/icons/` directory
**Performance issues**: Try reducing the number of selected cards or clearing your browser cache
**Build errors**: Make sure all dependencies are installed with `npm install`

---

Built with ❤️ for memory card game enthusiasts