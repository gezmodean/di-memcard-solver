# Contributing to Memory Card Grid Solver

Thank you for your interest in contributing to the Memory Card Grid Solver! This document provides guidelines and information for contributors.

## Getting Started

1. Fork the repository on GitHub
2. Clone your fork locally
3. Create a new branch for your feature or bug fix
4. Make your changes
5. Test thoroughly
6. Submit a pull request

## Development Setup

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Git

### Installation

```bash
git clone https://github.com/yourusername/memory-card-grid-solver.git
cd memory-card-grid-solver
npm install
npm run dev
```

## Code Style and Standards

### TypeScript

- Use TypeScript for all new code
- Maintain strict type checking
- Use meaningful variable and function names
- Add JSDoc comments for complex functions

### React Components

- Use functional components with hooks
- Follow React best practices
- Use proper prop typing with TypeScript interfaces
- Keep components focused and reusable

### Styling

- Use Tailwind CSS for styling
- Follow existing color scheme and design patterns
- Ensure responsive design works on all screen sizes
- Use semantic HTML elements

### Code Formatting

- Run `npm run lint` before committing
- Use `npm run lint:fix` to auto-fix linting issues
- Follow existing code patterns and conventions

## Project Structure

```
src/
├── components/          # React components
│   ├── Grid/           # Grid-related components
│   ├── PieceSelector/  # Card selection components
│   ├── Statistics/     # Stats and info panels
│   └── ...
├── lib/                # Utilities and game logic
│   ├── pieces/         # Card definitions and logic
│   ├── solver/         # Grid solving algorithms
│   ├── types.ts        # TypeScript type definitions
│   └── utils/          # Helper utilities
├── store/              # Zustand state management
└── App.tsx             # Main application component
```

## Adding New Features

### New Card Types

1. Add card data to `public/pieces.json`
2. Add corresponding icon to `public/icons/`
3. Update type definitions if needed
4. Test with the auto solver

### New Rarity Tiers

1. Update `src/lib/pieces/rarityProgression.ts`
2. Add color definitions to `src/lib/types.ts`
3. Update UI components to handle new rarity
4. Test progression calculations

### UI Components

1. Create component in appropriate directory
2. Use TypeScript interfaces for props
3. Follow existing styling patterns
4. Add to main app if needed
5. Test component thoroughly

## Testing

### Manual Testing

- Test all card selection scenarios
- Verify grid placement works correctly
- Check auto solver with various configurations
- Test export/import functionality
- Verify responsive design on different screen sizes

### Before Submitting

- [ ] Code builds without errors (`npm run build`)
- [ ] All linting passes (`npm run lint`)
- [ ] Type checking passes (`npm run type-check`)
- [ ] Features work as expected
- [ ] No console errors or warnings
- [ ] Responsive design works properly

## Bug Reports

When reporting bugs, please include:

1. **Clear description** of the issue
2. **Steps to reproduce** the problem
3. **Expected behavior** vs actual behavior
4. **Environment details** (browser, OS, etc.)
5. **Screenshots** if applicable
6. **Console errors** if any

## Feature Requests

For new features, please provide:

1. **Clear use case** and motivation
2. **Detailed description** of proposed functionality
3. **Examples** of how it would work
4. **Consideration** of implementation complexity

## Pull Request Guidelines

### Before Submitting

- Ensure your branch is up to date with main
- Test your changes thoroughly
- Run all quality checks (lint, type-check, build)
- Write clear commit messages

### PR Description

- Describe what changes you made and why
- Reference any related issues
- Include screenshots for UI changes
- List any breaking changes

### Review Process

- All PRs require review before merging
- Address feedback promptly
- Keep discussions constructive and focused
- Be patient with the review process

## Performance Considerations

- Keep bundle size reasonable
- Optimize rendering for large card collections
- Consider memory usage with large grids
- Test performance with various data sizes

## Accessibility

- Use semantic HTML elements
- Ensure keyboard navigation works
- Provide appropriate ARIA labels
- Test with screen readers when possible
- Maintain sufficient color contrast

## Documentation

- Update README.md for new features
- Add JSDoc comments for complex functions
- Include examples in code comments
- Update this contributing guide as needed

## Community Guidelines

- Be respectful and constructive
- Help other contributors
- Share knowledge and best practices
- Follow the code of conduct

## Getting Help

- Check existing issues and discussions
- Ask questions in GitHub discussions
- Reference relevant documentation
- Be specific about your problem

Thank you for contributing to Memory Card Grid Solver! 🎯