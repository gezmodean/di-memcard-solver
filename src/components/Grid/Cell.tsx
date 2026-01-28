import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { RARITY_COLORS } from '../../lib/types';
import { getIconPath } from '../../utils/assetPaths';

interface CellProps {
  x: number;
  y: number;
  pieceId: string | null;
  isConflict: boolean;
  isSelected: boolean;
  isHovered: boolean;
}

export const Cell: React.FC<CellProps> = ({ x, y, pieceId, isConflict, isSelected, isHovered }) => {
  const { pieces, selectPiece, setHoveredPosition, selectedPieceId, placePiece, placedPieces } = useGameStore();

  const piece = pieces.find(p => p.id === pieceId);
  const placedPiece = pieceId ? placedPieces.get(pieceId) : null;

  const handleClick = () => {
    if (pieceId) {
      selectPiece(pieceId);
    } else if (selectedPieceId) {
      // Try to place the selected piece at this position
      placePiece(selectedPieceId, x, y, 0);
    } else {
      selectPiece(null);
    }
  };

  const getCellStyle = () => {
    const style: React.CSSProperties = {};

    if (isConflict) {
      style.backgroundColor = 'rgba(220, 38, 38, 0.8)';
      style.boxShadow = '0 0 8px rgba(220, 38, 38, 0.5)';
    } else if (piece) {
      // Use the actual rarity colors at low opacity for backgrounds
      const rarityColor = RARITY_COLORS[piece.rarity] || RARITY_COLORS.common;
      // Convert hex to rgba with 0.2 opacity
      const hexToRgba = (hex: string, alpha: number) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
      };
      style.backgroundColor = hexToRgba(rarityColor, 0.2);
      style.boxShadow = 'inset 0 1px 2px rgba(255,255,255,0.1)';
    } else {
      style.backgroundColor = '#1f2937';
    }

    return style;
  };

  const getBorderStyle = () => {
    if (!piece || !placedPiece) return {};

    // Get this cell's position relative to the piece
    const relativeX = x - placedPiece.x;
    const relativeY = y - placedPiece.y;
    const shape = placedPiece.shape;

    // Check which sides are on the perimeter of the piece
    const isTopEdge = relativeY === 0 || !shape[relativeY - 1]?.[relativeX];
    const isBottomEdge = relativeY === shape.length - 1 || !shape[relativeY + 1]?.[relativeX];
    const isLeftEdge = relativeX === 0 || !shape[relativeY]?.[relativeX - 1];
    const isRightEdge = relativeX === shape[relativeY].length - 1 || !shape[relativeY]?.[relativeX + 1];

    // Note: Adjacent cell checking could be used for future shared border styling

    // Use the actual rarity colors from RARITY_COLORS but at full opacity for borders
    const color = RARITY_COLORS[piece.rarity] || RARITY_COLORS.common;
    const borderWidth = isConflict ? '3px' : isSelected && piece ? '3px' : '2px';

    return {
      borderTopWidth: isTopEdge ? borderWidth : '0px',
      borderBottomWidth: isBottomEdge ? borderWidth : '0px',
      borderLeftWidth: isLeftEdge ? borderWidth : '0px',
      borderRightWidth: isRightEdge ? borderWidth : '0px',
      borderTopColor: isTopEdge ? (isConflict ? '#ef4444' : isSelected && piece ? '#10b981' : color) : 'transparent',
      borderBottomColor: isBottomEdge ? (isConflict ? '#ef4444' : isSelected && piece ? '#10b981' : color) : 'transparent',
      borderLeftColor: isLeftEdge ? (isConflict ? '#ef4444' : isSelected && piece ? '#10b981' : color) : 'transparent',
      borderRightColor: isRightEdge ? (isConflict ? '#ef4444' : isSelected && piece ? '#10b981' : color) : 'transparent',
    };
  };

  const getRarityZIndex = () => {
    // Assign z-index based on rarity hierarchy
    if (!piece) return 5;

    const rarityHierarchy = {
      common: 10,
      uncommon: 20,
      rare: 30,
      epic: 40,
      legendary: 50,
      mythic: 60,
      transcendent: 70
    };

    return rarityHierarchy[piece.rarity] || 10;
  };

  const getCellClasses = () => {
    let classes = 'grid-cell w-11 h-11 flex items-center justify-center cursor-pointer transition-all duration-200 rounded-sm relative';

    if (piece) {
      classes += ' shadow-md';
      if (isConflict) {
        classes += ' conflict shadow-lg shadow-red-500/60';
      } else if (isSelected) {
        classes += ' selected shadow-lg shadow-green-500/60 ring-1 ring-green-400/50';
      }
    } else {
      classes += ' border border-gray-600 hover:border-gray-400';
    }

    if (isHovered) classes += ' ring-1 ring-white/50';

    return classes;
  };



  const getIconContent = () => {
    if (!piece || !piece.iconFile || !placedPiece) {
      return null;
    }

    // Calculate the geometric center of the piece shape
    const shape = placedPiece.shape;
    let totalX = 0;
    let totalY = 0;
    let cellCount = 0;

    // Sum up all the filled cell positions
    for (let shapeY = 0; shapeY < shape.length; shapeY++) {
      for (let shapeX = 0; shapeX < shape[shapeY].length; shapeX++) {
        if (shape[shapeY][shapeX] === 1) {
          totalX += shapeX;
          totalY += shapeY;
          cellCount++;
        }
      }
    }

    if (cellCount === 0) return null;

    // Calculate center position relative to piece origin
    let iconX = Math.round(totalX / cellCount);
    let iconY = Math.round(totalY / cellCount);

    // Verify the calculated center is within a filled cell, if not find nearest filled cell
    if (iconY >= shape.length || iconX >= shape[iconY].length || shape[iconY][iconX] !== 1) {
      // Find the closest filled cell to the calculated center
      let minDistance = Infinity;
      let bestX = 0;
      let bestY = 0;

      for (let shapeY = 0; shapeY < shape.length; shapeY++) {
        for (let shapeX = 0; shapeX < shape[shapeY].length; shapeX++) {
          if (shape[shapeY][shapeX] === 1) {
            const distance = Math.sqrt((shapeX - iconX) ** 2 + (shapeY - iconY) ** 2);
            if (distance < minDistance) {
              minDistance = distance;
              bestX = shapeX;
              bestY = shapeY;
            }
          }
        }
      }

      iconX = bestX;
      iconY = bestY;
    }

    // Convert to absolute grid position
    const absoluteIconX = placedPiece.x + iconX;
    const absoluteIconY = placedPiece.y + iconY;

    // Only render icon at the designated position
    if (x !== absoluteIconX || y !== absoluteIconY) {
      return null;
    }

    return (
      <img
        src={getIconPath(piece.iconFile)}
        alt={piece.name}
        className="w-8 h-8 object-contain pointer-events-none"
        style={{
          filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.8))',
          zIndex: 100
        }}
      />
    );
  };

  return (
    <div
      className={getCellClasses()}
      style={{ ...getCellStyle(), ...getBorderStyle(), zIndex: getRarityZIndex() }}
      onClick={handleClick}
      onMouseEnter={() => setHoveredPosition({ x, y })}
      onMouseLeave={() => setHoveredPosition(null)}
    >
      {getIconContent()}
    </div>
  );
};