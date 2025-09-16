import React, { useState } from 'react';

interface ShapeIconEditorProps {
  shape: number[][];
  iconFile: string;
  onChange: (shape: number[][]) => void;
  maxSize?: number;
}

export const ShapeIconEditor: React.FC<ShapeIconEditorProps> = ({
  shape,
  iconFile,
  onChange,
  maxSize = 6
}) => {
  const [gridSize, setGridSize] = useState(Math.max(shape.length, shape[0]?.length || 3, 3));

  // Ensure the shape array matches the current grid size
  const normalizeShape = (currentShape: number[][]): number[][] => {
    const normalized: number[][] = [];
    for (let y = 0; y < gridSize; y++) {
      normalized[y] = [];
      for (let x = 0; x < gridSize; x++) {
        normalized[y][x] = currentShape[y]?.[x] || 0;
      }
    }
    return normalized;
  };

  const currentShape = normalizeShape(shape);

  const handleCellClick = (x: number, y: number) => {
    const newShape = currentShape.map(row => [...row]);
    newShape[y][x] = newShape[y][x] === 1 ? 0 : 1;

    // Trim empty rows/columns and send to parent
    const trimmed = trimShape(newShape);
    if (trimmed.length === 0 || trimmed[0].length === 0) {
      // If completely empty, create a 1x1 shape
      onChange([[1]]);
    } else {
      onChange(trimmed);
    }
  };

  const trimShape = (shapeToTrim: number[][]): number[][] => {
    // Find bounds
    let minRow = shapeToTrim.length, maxRow = -1;
    let minCol = shapeToTrim[0]?.length || 0, maxCol = -1;

    for (let y = 0; y < shapeToTrim.length; y++) {
      for (let x = 0; x < shapeToTrim[y].length; x++) {
        if (shapeToTrim[y][x] === 1) {
          minRow = Math.min(minRow, y);
          maxRow = Math.max(maxRow, y);
          minCol = Math.min(minCol, x);
          maxCol = Math.max(maxCol, x);
        }
      }
    }

    if (minRow > maxRow || minCol > maxCol) {
      return []; // No shape found
    }

    // Extract trimmed shape
    const trimmed: number[][] = [];
    for (let y = minRow; y <= maxRow; y++) {
      trimmed.push(shapeToTrim[y].slice(minCol, maxCol + 1));
    }

    return trimmed;
  };

  const clearShape = () => {
    onChange([[1]]);
  };

  const changeGridSize = (newSize: number) => {
    setGridSize(newSize);
    // Reset to single cell if changing size
    onChange([[1]]);
  };

  const getCellCount = () => {
    return currentShape.flat().filter(cell => cell === 1).length;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Shape Editor</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Grid Size:</span>
          <select
            value={gridSize}
            onChange={(e) => changeGridSize(parseInt(e.target.value))}
            className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm"
          >
            {Array.from({ length: maxSize - 2 }, (_, i) => i + 3).map(size => (
              <option key={size} value={size}>{size}×{size}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-400">
        <span>Cells: {getCellCount()}</span>
        <button
          onClick={clearShape}
          className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-xs transition-colors"
        >
          Clear
        </button>
      </div>

      {/* Shape Grid */}
      <div className="border border-gray-600 rounded p-4 bg-gray-800">
        <div
          className="grid gap-1 mx-auto w-fit"
          style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}
        >
          {currentShape.map((row, y) =>
            row.map((cell, x) => (
              <button
                key={`${y}-${x}`}
                onClick={() => handleCellClick(x, y)}
                className={`w-8 h-8 border border-gray-500 rounded transition-all hover:scale-105 ${
                  cell === 1
                    ? 'bg-blue-500 border-blue-400'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                {cell === 1 && (
                  <div className="w-full h-full flex items-center justify-center">
                    {iconFile ? (
                      <img
                        src={`/icons/${iconFile}`}
                        alt="icon"
                        className="w-6 h-6 object-contain"
                        style={{ imageRendering: 'pixelated' }}
                      />
                    ) : (
                      <span className="text-xs">•</span>
                    )}
                  </div>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      <div className="text-xs text-gray-400 text-center">
        Click cells to toggle shape. Icons are automatically centered.
      </div>
    </div>
  );
};