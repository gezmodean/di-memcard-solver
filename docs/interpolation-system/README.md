# Special Effects Interpolation System

The Interpolation System is the core feature for designing and fine-tuning special effects for memory cards. It provides two powerful view modes for creating precise value progressions across all 200 memory card levels.

## 🎯 Overview

The system allows you to define special effects that scale with memory card levels, supporting:
- **Key Level Interpolation**: Define values at specific levels (1, 100, 120, 140, 160, 180, 200)
- **Linear Interpolation**: Automatically calculate smooth progressions between key levels
- **Large Number Support**: Full game number format (1A, 2.5B, 500C, etc.)
- **Comprehensive Editing**: Fine-tune any value at any level from 1-200

## 📊 View Modes

### [Simple View](./simple-view.md)
Perfect for quick setup and initial design:
- **Key Level Table**: Edit values at 7 critical levels
- **Single Interpolate Button**: Generate all 200 levels at once
- **Multiple Variables**: Handle all effect variables in one table
- **Instant Preview**: See effect descriptions with calculated values

![Simple View Overview](../screenshots/simple-view-overview.png)

### [Detailed View](./detailed-view.md)
For precision editing and fine-tuning:
- **Complete 200-Level Table**: Every level is editable
- **Multi-Variable Columns**: All variables shown side-by-side
- **Sticky Save Button**: Always accessible while scrolling
- **Real-time Updates**: Immediate feedback on value changes

![Detailed View Overview](../screenshots/detailed-view-overview.png)

## 🔄 Workflow

The recommended workflow combines both view modes:

1. **Start in Simple View**: Set key level values and interpolate
2. **Switch to Detailed View**: Fine-tune specific levels as needed
3. **Return to Simple View**: Values persist, no data loss
4. **Re-interpolate if needed**: Only when you want to regenerate

## ✨ Key Features

### Persistent Table Data
- Values persist when switching between views
- Interpolation only regenerates when explicitly requested
- No accidental data loss during navigation

### Large Number Format Support
- **Input**: `1000`, `1.5A`, `2.3B`, `500C`
- **Display**: Automatic formatting in game style
- **Calculation**: Full precision maintained during interpolation

### Advanced Interpolation
- **Piecewise Linear**: Smooth curves between key points
- **Precision Handling**: Large numbers maintain full accuracy
- **Multiple Variables**: All effect variables interpolated together

## 🎮 Game Integration

The system is designed specifically for the Darkstar Idle memory card system:
- **Level Range**: Supports levels 1-200 (including limit breaks)
- **Number Format**: Native game number abbreviations
- **Effect Variables**: Full support for complex multi-variable effects
- **Preview System**: Shows exactly how effects appear in-game

## 📖 Detailed Guides

- [**Simple View Guide**](./simple-view.md) - Key level editing and interpolation
- [**Detailed View Guide**](./detailed-view.md) - Comprehensive table editing
- [**Large Number System**](../technical/large-numbers.md) - Number format reference
- [**Effect Variables**](../technical/special-effects.md) - Variable system details

## 🚀 Quick Start

1. Open the Special Effect Editor
2. Enter your effect description with `{variableName}` placeholders
3. Click "Update Variables from Description"
4. Use Simple View to set key level values
5. Click "Interpolate All Variables"
6. Switch to Detailed View for fine-tuning
7. Save when satisfied

The system makes it easy to create professional-quality special effects with smooth, balanced progressions that feel natural in the game!