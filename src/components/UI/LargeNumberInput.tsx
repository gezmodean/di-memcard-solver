import React, { useState, useEffect } from 'react';
import { formatLargeNumber, parseLargeNumber, isValidLargeNumber } from '../../lib/utils/numberFormat';

interface LargeNumberInputProps {
  value: number;
  onChange: (value: number) => void;
  className?: string;
  placeholder?: string;
  min?: number;
  max?: number;
  disabled?: boolean;
}

export const LargeNumberInput: React.FC<LargeNumberInputProps> = ({
  value,
  onChange,
  className = '',
  placeholder = '0',
  min = 0,
  max,
  disabled = false
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isValid, setIsValid] = useState(true);
  const [isFocused, setIsFocused] = useState(false);

  // Update input value when external value changes
  useEffect(() => {
    if (!isFocused) {
      setInputValue(formatLargeNumber(value));
    }
  }, [value, isFocused]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    // Validate input
    const valid = newValue === '' || isValidLargeNumber(newValue);
    setIsValid(valid);

    if (valid && newValue !== '') {
      const parsedValue = parseLargeNumber(newValue);

      // Apply min/max constraints
      let constrainedValue = parsedValue;
      if (min !== undefined && constrainedValue < min) {
        constrainedValue = min;
      }
      if (max !== undefined && constrainedValue > max) {
        constrainedValue = max;
      }

      onChange(constrainedValue);
    } else if (newValue === '') {
      onChange(0);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    // Show raw input when focused for easier editing
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Format the display value when not focused
    if (isValid) {
      const parsedValue = inputValue === '' ? 0 : parseLargeNumber(inputValue);
      setInputValue(formatLargeNumber(parsedValue));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow: backspace, delete, tab, escape, enter, decimal point
    if (['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(e.key) ||
        // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+Z
        (e.ctrlKey && ['a', 'c', 'v', 'x', 'z'].includes(e.key.toLowerCase()))) {
      return;
    }

    // Allow: numbers, letters (for magnitude), decimal point, period
    if (!/^[\d.A-Za-z]$/.test(e.key)) {
      e.preventDefault();
    }
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className={`
          ${className}
          ${!isValid ? 'border-red-500 bg-red-50/10 text-red-400' : ''}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      />

      {/* Validation indicator */}
      {!isValid && inputValue !== '' && (
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-red-400 text-xs">
          Invalid format
        </div>
      )}

      {/* Helper text */}
      {isFocused && (
        <div className="absolute top-full left-0 mt-1 text-xs text-gray-400 z-10 bg-gray-800 px-2 py-1 rounded shadow-lg border border-gray-600">
          Examples: 1000, 1.5A, 2.3B, 500C
        </div>
      )}
    </div>
  );
};