import React from 'react';
import type { Piece } from '../../lib/types';

interface SkillDescriptionProps {
  piece: Piece;
  className?: string;
}

/**
 * Renders a piece's skill description with [#TagN] variables replaced
 * by their level-appropriate values, styled with color and bold.
 * Values are shown as raw numbers (not letter-abbreviated).
 */
export const SkillDescription: React.FC<SkillDescriptionProps> = ({ piece, className = '' }) => {
  const description = piece.gameData?.description;
  if (!description) return null;

  const tags = piece.gameData?.descTags;
  const idx = Math.max(0, Math.min(piece.level - 1, 199));

  // Split description on [#TagN] patterns and build React elements
  const parts: React.ReactNode[] = [];
  const tagPattern = /\[#Tag(\d+)\]/g;
  let lastIndex = 0;
  let match;

  while ((match = tagPattern.exec(description)) !== null) {
    // Add text before the tag
    if (match.index > lastIndex) {
      parts.push(description.slice(lastIndex, match.index));
    }

    const tagNum = parseInt(match[1], 10);
    const tagIndex = tagNum - 1;
    const val = tags?.[tagIndex]?.[idx] ?? 0;

    // Format as raw number (no letter abbreviation)
    const display = val % 1 === 0 ? String(val) : val.toFixed(2);

    // Check if followed by % in the description
    const afterTag = description.slice(match.index + match[0].length);
    const hasPercent = afterTag.startsWith('%');

    parts.push(
      <span
        key={`tag-${tagNum}-${match.index}`}
        className="font-bold text-yellow-300"
      >
        {display}{hasPercent ? '%' : ''}
      </span>
    );

    // Skip the % if we included it in the styled span
    lastIndex = match.index + match[0].length + (hasPercent ? 1 : 0);
  }

  // Add remaining text
  if (lastIndex < description.length) {
    parts.push(description.slice(lastIndex));
  }

  return <span className={className}>{parts}</span>;
};
