import React, { useState } from 'react';

interface ShapeEditorProps {
  shape: number[][];
  onChange: (shape: number[][]) => void;
  maxSize?: number;
}

export const ShapeEditor: React.FC<ShapeEditorProps> = ({ shape, onChange, maxSize = 6 }) => {
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

  const [currentShape, setCurrentShape] = useState(() => normalizeShape(shape));

  const toggleCell = (x: number, y: number) => {
    const newShape = currentShape.map(row => [...row]);
    newShape[y][x] = newShape[y][x] === 1 ? 0 : 1;
    setCurrentShape(newShape);

    // Trim empty rows and columns before passing to parent
    const trimmedShape = trimShape(newShape);
    onChange(trimmedShape);
  };

  const trimShape = (shapeToTrim: number[][]): number[][] => {
    // Find bounds of the shape
    let minRow = shapeToTrim.length, maxRow = -1;
    let minCol = shapeToTrim[0].length, maxCol = -1;

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

    // If no cells are filled, return a 1x1 shape
    if (maxRow === -1) return [[1]];

    // Extract the minimal bounding box
    const trimmed: number[][] = [];
    for (let y = minRow; y <= maxRow; y++) {
      trimmed.push(shapeToTrim[y].slice(minCol, maxCol + 1));
    }

    return trimmed;
  };

  const clearShape = () => {
    const emptyShape = Array(gridSize).fill(null).map(() => Array(gridSize).fill(0));
    setCurrentShape(emptyShape);
    onChange([[1]]);
  };

  const changeGridSize = (newSize: number) => {
    setGridSize(newSize);
    // Clear the shape when changing grid size
    const emptyShape = Array(newSize).fill(null).map(() => Array(newSize).fill(0));
    setCurrentShape(emptyShape);
    onChange([[1]]);
  };

  const getCellCount = () => {
    return currentShape.flat().filter(cell => cell === 1).length;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <label className="text-sm">Grid Size:</label>
          <select
            value={gridSize}
            onChange={(e) => changeGridSize(parseInt(e.target.value))}
            className="bg-gray-600 border border-gray-500 rounded px-2 py-1 text-sm"
          >
            {Array.from({ length: maxSize - 2 }, (_, i) => i + 3).map(size => (
              <option key={size} value={size}>{size}x{size}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-300">Cells: {getCellCount()}</span>
          <button
            onClick={clearShape}
            className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-xs"
          >
            Clear
          </button>
        </div>
      </div>

      <div
        className="inline-grid gap-1 p-2 bg-gray-700 rounded"
        style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}
      >
        {currentShape.map((row, y) =>
          row.map((cell, x) => (
            <div
              key={`${x}-${y}`}
              className={`
                w-8 h-8 border border-gray-500 cursor-pointer transition-all duration-200
                flex items-center justify-center text-xs font-bold
                ${cell === 1
                  ? 'bg-blue-500 hover:bg-blue-400 text-white'
                  : 'bg-gray-800 hover:bg-gray-700 text-gray-400'
                }
              `}
              onClick={() => toggleCell(x, y)}
            >
              {cell === 1 ? '■' : '□'}
            </div>
          ))
        )}
      </div>

      <div className="text-xs text-gray-400">
        Click cells to toggle them on/off. The shape will be automatically trimmed to its minimal bounding box.
      </div>
    </div>
  );
};