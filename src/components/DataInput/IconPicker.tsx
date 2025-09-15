import React, { useState } from 'react';

interface IconPickerProps {
  selectedIcon: string;
  onSelect: (iconFile: string) => void;
  availableIcons: string[];
}

export const IconPicker: React.FC<IconPickerProps> = ({ selectedIcon, onSelect, availableIcons }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (iconFile: string) => {
    onSelect(iconFile);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <label className="block text-sm mb-1">Icon:</label>

      {/* Selected Icon Display */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 cursor-pointer hover:bg-gray-500 transition-colors flex items-center gap-2"
      >
        <img
          src={`/icons/${selectedIcon}`}
          alt="Selected icon"
          className="w-8 h-8 object-contain bg-gray-800 rounded"
        />
        <span className="text-sm flex-1">{selectedIcon}</span>
        <span className="text-gray-400">{isOpen ? '▲' : '▼'}</span>
      </div>

      {/* Icon Grid Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-gray-700 border border-gray-500 rounded shadow-lg max-h-80 overflow-y-auto">
          <div className="p-2">
            <div className="text-xs text-gray-300 mb-2">Click to select an icon:</div>
            <div className="grid grid-cols-6 gap-2">
              {availableIcons.map((iconFile) => (
                <div
                  key={iconFile}
                  onClick={() => handleSelect(iconFile)}
                  className={`
                    p-2 rounded cursor-pointer transition-all duration-200 border-2
                    hover:bg-gray-600 hover:scale-105
                    ${selectedIcon === iconFile
                      ? 'border-blue-400 bg-gray-600'
                      : 'border-transparent'
                    }
                  `}
                  title={iconFile}
                >
                  <img
                    src={`/icons/${iconFile}`}
                    alt={iconFile}
                    className="w-10 h-10 object-contain bg-gray-800 rounded mx-auto"
                  />
                  <div className="text-xs text-center mt-1 text-gray-300 truncate">
                    {iconFile.replace('.png', '').replace('sprite-', '')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Overlay to close dropdown when clicking outside */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};