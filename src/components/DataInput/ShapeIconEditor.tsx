import React, { useState } from 'react';

interface ShapeIconEditorProps {
  shape: number[][];
  iconPosition: { x: number; y: number } | null;
  iconFile: string;
  onChange: (shape: number[][]) => void;
  onIconPositionChange: (position: { x: number; y: number } | null) => void;
  maxSize?: number;
}

export const ShapeIconEditor: React.FC<ShapeIconEditorProps> = ({
  shape,
  iconPosition,
  iconFile,
  onChange,
  onIconPositionChange,
  maxSize = 6
}) => {
  const [gridSize, setGridSize] = useState(Math.max(shape.length, shape[0]?.length || 3, 3));
  const [mode, setMode] = useState<'shape' | 'icon'>('shape');

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

  const handleCellClick = (x: number, y: number) => {
    if (mode === 'shape') {
      // Toggle shape cell
      const newShape = currentShape.map(row => [...row]);
      newShape[y][x] = newShape[y][x] === 1 ? 0 : 1;
      setCurrentShape(newShape);

      // Trim empty rows and columns before passing to parent
      const trimmedShape = trimShape(newShape);
      onChange(trimmedShape);

      // Update icon position if it's outside the new shape
      if (iconPosition && trimmedShape[iconPosition.y]?.[iconPosition.x] !== 1) {
        // Find first valid position for icon
        for (let ty = 0; ty < trimmedShape.length; ty++) {
          for (let tx = 0; tx < trimmedShape[ty].length; tx++) {
            if (trimmedShape[ty][tx] === 1) {
              onIconPositionChange({ x: tx, y: ty });
              return;
            }
          }
        }
        onIconPositionChange(null);
      }
    } else if (mode === 'icon') {
      // Set icon position (only if cell is part of shape)
      if (currentShape[y][x] === 1) {
        // Calculate relative position in trimmed shape
        const trimmed = trimShape(currentShape);
        const bounds = getShapeBounds(currentShape);
        const relativeX = x - bounds.minCol;
        const relativeY = y - bounds.minRow;

        if (relativeX >= 0 && relativeX < trimmed[0].length && relativeY >= 0 && relativeY < trimmed.length) {
          onIconPositionChange({ x: relativeX, y: relativeY });
        }
      }
    }
  };

  const getShapeBounds = (shapeToCheck: number[][]) => {
    let minRow = shapeToCheck.length, maxRow = -1;
    let minCol = shapeToCheck[0].length, maxCol = -1;

    for (let y = 0; y < shapeToCheck.length; y++) {
      for (let x = 0; x < shapeToCheck[y].length; x++) {
        if (shapeToCheck[y][x] === 1) {
          minRow = Math.min(minRow, y);
          maxRow = Math.max(maxRow, y);
          minCol = Math.min(minCol, x);
          maxCol = Math.max(maxCol, x);
        }
      }
    }

    return { minRow, maxRow, minCol, maxCol };
  };

  const trimShape = (shapeToTrim: number[][]): number[][] => {
    const bounds = getShapeBounds(shapeToTrim);

    // If no cells are filled, return a 1x1 shape
    if (bounds.maxRow === -1) return [[1]];

    // Extract the minimal bounding box
    const trimmed: number[][] = [];
    for (let y = bounds.minRow; y <= bounds.maxRow; y++) {
      trimmed.push(shapeToTrim[y].slice(bounds.minCol, bounds.maxCol + 1));
    }

    return trimmed;
  };

  const clearShape = () => {
    const emptyShape = Array(gridSize).fill(null).map(() => Array(gridSize).fill(0));
    setCurrentShape(emptyShape);
    onChange([[1]]);
    onIconPositionChange(null);
  };

  const changeGridSize = (newSize: number) => {
    setGridSize(newSize);
    // Clear the shape when changing grid size
    const emptyShape = Array(newSize).fill(null).map(() => Array(newSize).fill(0));
    setCurrentShape(emptyShape);
    onChange([[1]]);
    onIconPositionChange(null);
  };

  const getCellCount = () => {
    return currentShape.flat().filter(cell => cell === 1).length;
  };

  const isIconPosition = (x: number, y: number) => {
    if (!iconPosition) return false;
    const bounds = getShapeBounds(currentShape);
    return (x - bounds.minCol === iconPosition.x) && (y - bounds.minRow === iconPosition.y);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
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
            <label className="text-sm">Mode:</label>
            <div className="flex bg-gray-600 rounded overflow-hidden">
              <button
                onClick={() => setMode('shape')}
                className={`px-3 py-1 text-sm transition-colors ${
                  mode === 'shape' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white'
                }`}
              >
                Shape
              </button>
              <button
                onClick={() => setMode('icon')}
                className={`px-3 py-1 text-sm transition-colors ${
                  mode === 'icon' ? 'bg-green-600 text-white' : 'text-gray-300 hover:text-white'
                }`}
              >
                Icon
              </button>
            </div>
          </div>
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
          row.map((cell, x) => {
            const isIcon = isIconPosition(x, y);
            const canPlaceIcon = cell === 1 && mode === 'icon';

            return (
              <div
                key={`${x}-${y}`}
                className={`
                  w-10 h-10 border border-gray-500 cursor-pointer transition-all duration-200
                  flex items-center justify-center text-xs font-bold relative
                  ${cell === 1
                    ? mode === 'shape'
                      ? 'bg-blue-500 hover:bg-blue-400 text-white'
                      : canPlaceIcon
                        ? 'bg-blue-500 hover:bg-blue-400 text-white'
                        : 'bg-blue-500 text-white'
                    : 'bg-gray-800 hover:bg-gray-700 text-gray-400'
                  }
                  ${mode === 'icon' && canPlaceIcon ? 'ring-2 ring-green-400' : ''}
                `}
                onClick={() => handleCellClick(x, y)}
              >
                {cell === 1 ? '■' : '□'}
                {isIcon && (
                  <img
                    src={`/icons/${iconFile}`}
                    alt="Icon"
                    className="absolute inset-0.5 w-8 h-8 object-contain"
                  />
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="text-xs text-gray-400 space-y-1">
        <div>
          <strong>Shape Mode:</strong> Click cells to toggle them on/off to design the piece shape.
        </div>
        <div className="text-gray-400">
          <strong>Icon Positioning:</strong> Icons are automatically centered. Manual positioning is disabled.
        </div>
      </div>
    </div>
  );
};