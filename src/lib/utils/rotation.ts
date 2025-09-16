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

