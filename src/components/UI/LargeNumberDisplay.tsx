import React from 'react';
import { formatLargeNumber } from '../../lib/utils/numberFormat';

interface LargeNumberDisplayProps {
  value: number;
  className?: string;
  prefix?: string;
  suffix?: string;
  title?: string;
}

export const LargeNumberDisplay: React.FC<LargeNumberDisplayProps> = ({
  value,
  className = '',
  prefix = '',
  suffix = '',
  title
}) => {
  const formattedValue = formatLargeNumber(value);

  return (
    <span className={className} title={title || `${value.toLocaleString()}`}>
      {prefix}{formattedValue}{suffix}
    </span>
  );
};