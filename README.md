# Memory Card Grid Solver for Darkstar Idle

A sophisticated React TypeScript web application for optimizing memory card placement on a 9×9 grid for the game **Darkstar Idle**. Features advanced special effects editing with interpolation system, comprehensive card management, and intelligent auto-solving capabilities.

![Memory Card Grid Solver](./docs/screenshots/simple-view-with-interpolation.png)

## ✨ Key Features

### 🎯 Grid Optimization
- **Interactive 9×9 Grid**: Visual placement with real-time conflict detection
- **Smart Auto Solver**: Intelligent algorithms find optimal placements automatically
- **Alternative Solutions**: Discover multiple placement strategies for the same card set

### 🃏 Advanced Card Management
- **Seven-Tier Rarity System**: Common → Transcendent with unique progression curves
- **Level System**: Cards from 1-200 with limit breaks at levels 100, 120, 140, 160, 180
- **Shape Visualization**: Complex card shapes with accurate placement previews
- **Comprehensive Statistics**: Real-time power calculations and detailed card stats

### ⚡ Special Effects System
- **Advanced Effects Editor**: Create complex conditional effects with variables
- **Interpolation System**: Simple and detailed views for balanced effect progressions
- **Large Number Support**: Game-accurate format (1A, 2.5B, etc.) with decimal precision
- **Real-Time Preview**: See exactly how effects will appear in-game

### 🔧 Professional Tools
- **Site Configuration**: Admin panel for managing card definitions and rarities
- **Player Data Management**: Separate user progress and configuration data
- **Export/Import**: Save and share configurations as JSON files
- **Comprehensive Documentation**: In-app guides and technical references

## Getting Started

### Prerequisites

Before running the application, make sure you have:

- **Node.js** (version 18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- A modern web browser (Chrome, Firefox, Safari, or Edge)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/gezmodean/di-memcard-solver.git
   cd di-memcard-solver
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser** and navigate to `http://localhost:5173`

> The application will automatically load the default Darkstar Idle card data and be ready to use immediately.

### Building for Production

To create a production build:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

## 🎮 How to Use

### Quick Start

1. **Select Cards**: Click cards from the inventory (left panel) to add them to your queue
2. **Auto Solve**: Click "Find Any Solution" to automatically place selected cards
3. **Manual Fine-Tuning**: Click grid cells to manually adjust placements
4. **View Statistics**: Check the right panel for total collection power and active effects

### Advanced Workflows

**Card Configuration**:
- Access **⚙️ Settings** → **Manage Pieces** for advanced card editing
- Create custom special effects with variables like `{atkBonus}` and `{hpMultiplier}`
- Use the interpolation system to balance effects across all 200 levels

**Effect Design**:
- **Simple View**: Set key level values and interpolate smooth progressions
- **Detailed View**: Fine-tune every individual level from 1-200
- **Large Numbers**: Use game format (2.5B) or standard notation (2500000000)

**Data Management**:
- **👤 My Data**: Manage your personal card levels and unlocks
- **🔓 Unlock All**: Instantly unlock all cards for testing
- Export/import configurations for sharing with other players

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

- **React 19** - Modern UI framework with latest features
- **TypeScript** - Type safety and enhanced development experience
- **Vite** - Lightning-fast development and build tooling
- **Tailwind CSS** - Utility-first styling framework
- **Zustand** - Lightweight and efficient state management
- **ESLint** - Code quality and consistency enforcement

### Project Structure

```
di-memcard-solver/
├── docs/                    # Comprehensive documentation
│   ├── interpolation-system/  # Special effects guides
│   ├── technical/             # Technical references
│   └── screenshots/           # Feature demonstrations
├── public/
│   ├── pieces.json           # Default card definitions
│   └── icons/               # Card icon sprites
├── src/
│   ├── components/
│   │   ├── Admin/           # Site configuration tools
│   │   ├── Player/          # User data management
│   │   ├── PieceEditor/     # Special effects editor
│   │   ├── Grid/            # 9×9 grid visualization
│   │   ├── Solver/          # Auto-solver algorithms
│   │   └── UI/              # Reusable components
│   ├── lib/
│   │   ├── pieces/          # Card logic and rarity system
│   │   ├── solver/          # Grid solving algorithms
│   │   ├── types.ts         # TypeScript definitions
│   │   └── utils/           # Utility functions
│   ├── store/               # Zustand state management
│   └── App.tsx              # Main application
└── package.json
```

### Performance Considerations

- Uses React 19 with modern hooks for optimal performance
- Efficient state management with Zustand
- Optimized grid rendering for smooth interactions
- Lazy loading of card icons and assets

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - TypeScript compilation + Vite production build
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint code quality checks
- `npm run lint:fix` - Auto-fix ESLint issues
- `npm run type-check` - TypeScript type checking without compilation
- `npm run clean` - Clean build artifacts and cache

### Adding New Cards

Use the in-app **Settings** panel for a user-friendly card creation experience:

1. **⚙️ Settings** → **Manage Pieces** → Select any card → **Add Effect**
2. Create special effects with variables: `Increases ATK by {atkBonus}%`
3. Use the interpolation system to balance effects across levels 1-200
4. Export your configuration to share with others

### Advanced Customization

**Special Effects System**:
- Support for complex variables with piecewise linear interpolation
- Large number format matching Darkstar Idle's display system
- Real-time preview showing exact in-game appearance

**Rarity Configuration**:
Customize progression curves in **Settings** or edit `src/lib/pieces/rarityProgression.ts`

**Documentation**:
Refer to `/docs/` for comprehensive guides:
- [Interpolation System](./docs/interpolation-system/)
- [Large Number Format](./docs/technical/large-numbers.md)
- [Technical Reference](./docs/)

## 📖 Documentation

Comprehensive documentation is available in the `/docs/` directory:

### **🎛️ Interpolation System**
- **[Overview](./docs/interpolation-system/README.md)** - Complete system architecture and workflow
- **[Simple View Guide](./docs/interpolation-system/simple-view.md)** - Key level interpolation for rapid effect design
- **[Detailed View Guide](./docs/interpolation-system/detailed-view.md)** - Comprehensive 200-level table editing

### **⚙️ Technical References**
- **[Large Number System](./docs/technical/large-numbers.md)** - Game-accurate number formatting (1A, 2.5B, etc.)

### **📊 Screenshots**
Visual demonstrations of all major features are available in [`/docs/screenshots/`](./docs/screenshots/).

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