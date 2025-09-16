# Large Number System

The Memory Card Grid Solver uses Darkstar Idle's native large number format, supporting values from simple integers to massive numbers in the quintillions and beyond. This system ensures perfect compatibility with the game's number display and calculation systems.

## 🔢 Number Format Overview

### Supported Formats

The system accepts and displays numbers in multiple formats:

| Format | Example Input | Parsed Value | Display Output |
|--------|---------------|--------------|----------------|
| **Integer** | `1000` | 1,000 | `1A` |
| **Decimal** | `1.5` | 1.5 | `1.5` |
| **Game Notation** | `2.5B` | 2,500,000,000 | `2.5B` |
| **Scientific** | `1e12` | 1,000,000,000,000 | `1A` |

### Magnitude Scale

The system uses alphabetical magnitude indicators:

| Letter | Multiplier | Name | Example |
|--------|------------|------|---------|
| *(none)* | 1 | Units | `999` |
| **A** | 1,000 | Thousand | `1A` = 1,000 |
| **B** | 1,000,000 | Million | `2.5B` = 2,500,000,000 |
| **C** | 1,000,000,000 | Billion | `100C` = 100,000,000,000,000 |
| **D** | 1,000,000,000,000 | Trillion | `1.2D` |
| **...** | *(continues)* | | |
| **Z** | 10^78 | | `5Z` |
| **AA** | 10^81 | | `1AA` |
| **AB** | 10^84 | | `2.5AB` |

*The system supports up to `AZ` (10^156) - far beyond any practical game values.*

## 🎯 Input System

### LargeNumberInput Component

All number inputs in the interpolation system use the `LargeNumberInput` component:

```typescript
// Example usage
<LargeNumberInput
  value={1250000000}
  onChange={(value) => setMyValue(value)}
  className="input-style"
/>

// Displays as: "1.25B"
// Accepts input: "1.25B", "1250000000", "1.25e9"
```

### Input Validation

**Valid Inputs:**
- `1000` (plain number)
- `1.5` (decimal)
- `2.5B` (game notation)
- `1e6` (scientific notation)
- `0.5A` (decimal with magnitude)

**Invalid Inputs:**
- `2.5X` (invalid magnitude letter)
- `1500B` (base number ≥ 1000)
- `ABC` (non-numeric)
- `-500` (negative numbers not supported)

### Real-Time Features

- **Format Validation**: Invalid formats highlighted in red
- **Auto-Formatting**: Numbers converted to optimal display format
- **Focus Behavior**: Raw input shown while editing, formatted when not focused
- **Helper Text**: Format examples shown on focus

## ⚙️ Technical Implementation

### Core Functions

#### `formatLargeNumber(num: number): string`
Converts numeric values to game notation:
```typescript
formatLargeNumber(1000)       // "1A"
formatLargeNumber(2500000000) // "2.5B"
formatLargeNumber(750)        // "750"
```

#### `parseLargeNumber(input: string): number`
Converts string input to numeric value:
```typescript
parseLargeNumber("1A")    // 1000
parseLargeNumber("2.5B")  // 2500000000
parseLargeNumber("750")   // 750
```

#### `isValidLargeNumber(input: string): boolean`
Validates input format:
```typescript
isValidLargeNumber("1.5B")  // true
isValidLargeNumber("1500B") // false (base ≥ 1000)
isValidLargeNumber("2X")    // false (invalid magnitude)
```

### Precision Handling

#### Standard Numbers (< 1e15)
- **Rounded Display**: 2 significant figures for readability
- **Full Precision**: Calculations maintain full precision
- **Smart Rounding**: `1.999A` becomes `2A` for clean display

#### Very Large Numbers (≥ 1e15)
- **Full Precision**: No rounding applied
- **JavaScript Limits**: Precision maintained within JS Number limits
- **Display**: Raw values used for extreme precision

### Performance Characteristics

- **Input Parsing**: Sub-millisecond for typical inputs
- **Format Conversion**: Optimized for real-time display updates
- **Memory Usage**: Minimal overhead, numbers stored as native JS Numbers
- **Validation**: Fast regex-based validation

## 🎮 Game Integration

### Display Consistency
The system perfectly matches Darkstar Idle's number formatting:
- Same magnitude letters and scaling
- Identical decimal precision rules
- Consistent abbreviation behavior

### Calculation Accuracy
- **Interpolation**: Maintains precision during curve generation
- **Large Value Math**: Handles extreme numbers correctly
- **Rounding Rules**: Matches game's display rounding

### User Experience
- **Familiar Format**: Players immediately recognize the notation
- **Easy Input**: Multiple input methods for convenience
- **Visual Feedback**: Clear indication of valid/invalid inputs

## 💡 Usage Guidelines

### Best Practices

#### For Effect Designers
- **Use Game Notation**: Input `2.5B` instead of `2500000000`
- **Reasonable Decimals**: Avoid excessive precision like `1.23456789B`
- **Consistent Scale**: Keep related values in similar magnitude ranges
- **Test Display**: Preview how numbers appear in-game

#### For Developers
- **Always Validate**: Use `isValidLargeNumber()` before parsing
- **Handle Errors**: Graceful fallback for invalid inputs
- **Performance**: Cache formatted strings for frequently displayed values
- **Precision**: Be aware of JavaScript Number limitations for extreme values

### Common Patterns

#### Progressive Scaling
```typescript
// Good: Consistent magnitude progression
const levels = [
  { level: 1, value: "5" },
  { level: 100, value: "1.2B" },
  { level: 200, value: "2.5B" }
];
```

#### Mixed Formats
```typescript
// Acceptable: Different input methods
const userInputs = [
  "1000",      // Plain number
  "1A",        // Game notation
  "1.0A",      // Decimal notation
  "1000.0"     // Decimal plain
];
// All parse to: 1000
```

## 🔗 Related Systems

### Interpolation Integration
- **Smooth Curves**: Large numbers interpolated correctly
- **Precision Preserved**: No loss during curve generation
- **Display Format**: Results automatically formatted

### Special Effects
- **Variable Values**: All effect variables support large numbers
- **Preview System**: Effects display with proper formatting
- **Game Compatibility**: Values work exactly as in Darkstar Idle

## 📚 Examples

### Simple Usage
```typescript
// Basic input/output
const input = "2.5B";
const parsed = parseLargeNumber(input);     // 2500000000
const formatted = formatLargeNumber(parsed); // "2.5B"
```

### Interpolation Example
```typescript
// Key level values
const keyValues = {
  1: parseLargeNumber("5"),      // 5
  100: parseLargeNumber("1.2B"), // 1200000000
  200: parseLargeNumber("2.5B")  // 2500000000
};

// Interpolated value at level 150
const level150 = interpolateValue(keyValues, 150);
const display = formatLargeNumber(level150); // "1.9B"
```

### Validation Example
```typescript
// Input validation
const validateInput = (input: string) => {
  if (!isValidLargeNumber(input)) {
    return { valid: false, error: "Invalid number format" };
  }

  const value = parseLargeNumber(input);
  return { valid: true, value, display: formatLargeNumber(value) };
};
```

The large number system provides seamless integration with Darkstar Idle's number format, ensuring that all values in the Memory Card Grid Solver display and behave exactly as players expect from the game!