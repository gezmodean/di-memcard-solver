export function rotateShape(shape: number[][], degrees: number): number[][] {
  const rotations = degrees / 90;
  let result = shape;

  for (let i = 0; i < rotations; i++) {
    result = rotate90(result);
  }

  return result;
}

function rotate90(shape: number[][]): number[][] {
  const rows = shape.length;
  const cols = shape[0].length;
  const rotated: number[][] = Array(cols).fill(null).map(() => Array(rows).fill(0));

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      rotated[j][rows - 1 - i] = shape[i][j];
    }
  }

  return rotated;
}

export function normalizeShape(shape: number[][]): number[][] {
  // Remove empty rows and columns to get the minimal bounding box
  let minRow = shape.length, maxRow = -1;
  let minCol = shape[0].length, maxCol = -1;

  for (let i = 0; i < shape.length; i++) {
    for (let j = 0; j < shape[0].length; j++) {
      if (shape[i][j] === 1) {
        minRow = Math.min(minRow, i);
        maxRow = Math.max(maxRow, i);
        minCol = Math.min(minCol, j);
        maxCol = Math.max(maxCol, j);
      }
    }
  }

  if (maxRow === -1) return [[]];

  const normalized: number[][] = [];
  for (let i = minRow; i <= maxRow; i++) {
    normalized.push(shape[i].slice(minCol, maxCol + 1));
  }

  return normalized;
}

export function rotateIconPosition(
  iconPosition: { x: number; y: number },
  originalShape: number[][],
  degrees: number
): { x: number; y: number } {
  const rotations = (degrees / 90) % 4;

  if (rotations === 0) {
    return { ...iconPosition };
  }

  // First, verify the original icon position is valid
  if (iconPosition.y < 0 || iconPosition.y >= originalShape.length ||
      iconPosition.x < 0 || iconPosition.x >= originalShape[0].length ||
      originalShape[iconPosition.y][iconPosition.x] !== 1) {
    // If invalid, find the first filled cell as fallback
    for (let y = 0; y < originalShape.length; y++) {
      for (let x = 0; x < originalShape[y].length; x++) {
        if (originalShape[y][x] === 1) {
          return rotateIconPosition({ x, y }, originalShape, degrees);
        }
      }
    }
  }

  // Rotate the shape to get the final rotated shape
  const rotatedShape = rotateShape(originalShape, degrees);

  // Apply the rotation transformation step by step
  let pos = { ...iconPosition };
  let currentShape = originalShape;

  for (let i = 0; i < rotations; i++) {
    const rows = currentShape.length;

    // For 90-degree clockwise rotation: (x, y) -> (y, rows - 1 - x)
    const newPos = { x: pos.y, y: rows - 1 - pos.x };
    pos = newPos;

    // Rotate the current shape for the next iteration
    currentShape = rotate90(currentShape);
  }

  // Validate the final position is within bounds and on a filled cell
  if (pos.y >= 0 && pos.y < rotatedShape.length &&
      pos.x >= 0 && pos.x < rotatedShape[pos.y].length &&
      rotatedShape[pos.y][pos.x] === 1) {
    return pos;
  }

  // If validation fails, find the first filled cell in the rotated shape
  for (let y = 0; y < rotatedShape.length; y++) {
    for (let x = 0; x < rotatedShape[y].length; x++) {
      if (rotatedShape[y][x] === 1) {
        return { x, y };
      }
    }
  }

  // Fallback to origin if all else fails
  return { x: 0, y: 0 };
}