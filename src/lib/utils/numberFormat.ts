// Order of magnitude letters used in the game
// In this game: 1A = 1,000, 1B = 1,000,000, etc.
const MAGNITUDE_LETTERS = [
  '', // 1-999 (no letter)
  'A', // 1,000
  'B', // 1,000,000
  'C', // 1,000,000,000
  'D', // 1,000,000,000,000
  'E', // 1,000,000,000,000,000
  'F', // 1,000,000,000,000,000,000
  'G', // 1,000,000,000,000,000,000,000
  'H', // 1,000,000,000,000,000,000,000,000
  'I', // 1,000,000,000,000,000,000,000,000,000
  'J', // 1,000,000,000,000,000,000,000,000,000,000
  'K', // 1,000,000,000,000,000,000,000,000,000,000,000
  'L', // 1,000,000,000,000,000,000,000,000,000,000,000,000
  'M', // 1,000,000,000,000,000,000,000,000,000,000,000,000,000
  'N',
  'O',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'U',
  'V',
  'W',
  'X',
  'Y',
  'Z',
  'AA',
  'AB',
  'AC',
  'AD',
  'AE',
  'AF',
  'AG',
  'AH',
  'AI',
  'AJ',
  'AK',
  'AL',
  'AM',
  'AN',
  'AO',
  'AP',
  'AQ',
  'AR',
  'AS',
  'AT',
  'AU',
  'AV',
  'AW',
  'AX',
  'AY',
  'AZ'
];

/**
 * Converts a number to abbreviated format (e.g., 1040000 -> "1.04B")
 */
export function formatLargeNumber(num: number): string {
  if (num < 1000) {
    return num.toString();
  }

  let magnitude = 0;
  let value = num;

  // Find the appropriate magnitude
  while (value >= 1000 && magnitude < MAGNITUDE_LETTERS.length - 1) {
    value /= 1000;
    magnitude++;
  }

  // Truncate to 2 decimal places (game uses truncation, not rounding) and remove trailing zeros
  const truncated = Math.floor(value * 100) / 100;
  const formatted = truncated % 1 === 0 ? truncated.toString() : truncated.toFixed(2).replace(/\.?0+$/, '');

  return `${formatted}${MAGNITUDE_LETTERS[magnitude]}`;
}

/**
 * Parses an abbreviated number string to actual number (e.g., "1.04B" -> 1040000000)
 */
export function parseLargeNumber(input: string): number {
  if (!input || typeof input !== 'string') {
    return 0;
  }

  const trimmed = input.trim().toUpperCase();

  // If it's just a number without abbreviation (allow integers, decimals, and numbers starting with decimal)
  if (/^\d*\.?\d+$/.test(trimmed)) {
    return parseFloat(trimmed) || 0;
  }

  // Extract number and magnitude parts (allow decimal numbers)
  const match = trimmed.match(/^(\d*\.?\d+)\s*([A-Z]+)$/);
  if (!match) {
    return 0;
  }

  const [, numberPart, magnitudePart] = match;
  const baseNumber = parseFloat(numberPart);

  if (isNaN(baseNumber)) {
    return 0;
  }

  // Find the magnitude multiplier
  const magnitudeIndex = MAGNITUDE_LETTERS.indexOf(magnitudePart);
  if (magnitudeIndex === -1) {
    // Unknown magnitude, return base number
    return baseNumber;
  }

  // Calculate final value
  const multiplier = Math.pow(1000, magnitudeIndex);
  return Math.floor(baseNumber * multiplier);
}

/**
 * Validates if a string is a valid large number format
 */
export function isValidLargeNumber(input: string): boolean {
  if (!input || typeof input !== 'string') {
    return false;
  }

  const trimmed = input.trim().toUpperCase();

  // Check if it's a plain number (allow integers, decimals, and numbers starting with decimal)
  if (/^\d*\.?\d+$/.test(trimmed)) {
    return !isNaN(parseFloat(trimmed));
  }

  // Check if it's abbreviated format (allow decimal numbers)
  const match = trimmed.match(/^(\d*\.?\d+)\s*([A-Z]+)$/);
  if (!match) {
    return false;
  }

  const [, numberPart, magnitudePart] = match;
  const baseNumber = parseFloat(numberPart);

  return !isNaN(baseNumber) &&
         baseNumber >= 1 &&
         baseNumber < 1000 &&
         MAGNITUDE_LETTERS.includes(magnitudePart);
}

/**
 * Gets suggestions for magnitude letters (for autocomplete)
 */
export function getMagnitudeSuggestions(input: string): string[] {
  const trimmed = input.trim().toUpperCase();
  return MAGNITUDE_LETTERS.filter(letter =>
    letter && letter.startsWith(trimmed)
  ).slice(0, 5);
}