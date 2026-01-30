import React, { useState, useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';
import type { Rarity, RarityConfig } from '../../lib/types';
import { LargeNumberInput } from '../UI/LargeNumberInput';

interface RarityProgressionEditorProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RarityProgressionEditor: React.FC<RarityProgressionEditorProps> = ({ isOpen, onClose }) => {
  const { rarityConfigs, updateRarityConfig, resetRarityConfigs } = useGameStore();
  const [configs, setConfigs] = useState(rarityConfigs);
  const [selectedRarity, setSelectedRarity] = useState<Rarity>('common');

  // Sync local state with store when rarityConfigs change
  useEffect(() => {
    setConfigs(rarityConfigs);
  }, [rarityConfigs]);

  if (!isOpen) return null;

  const getRarityColor = (rarity: string) => {
    const colorMap: Record<string, string> = {
      common: '#868aaf',
      uncommon: '#ccac94',
      rare: '#35ff81',
      epic: '#448aff',
      legendary: '#fff35c',
      mythic: '#9b6bec',
      transcendent: '#ff38af',
    };
    return colorMap[rarity] || '#868aaf';
  };

  const rarityOrder: Rarity[] = ['transcendent', 'mythic', 'legendary', 'epic', 'rare', 'uncommon', 'common'];

  const updateConfig = (rarity: Rarity, updates: Partial<RarityConfig>) => {
    const newConfig = { ...configs[rarity], ...updates };
    setConfigs(prev => ({
      ...prev,
      [rarity]: newConfig
    }));
    // Immediately save to store for persistence
    updateRarityConfig(rarity, newConfig);
  };

  const updateLimitBreak = (rarity: Rarity, breakLevel: keyof RarityConfig['limitBreaks'], updates: Partial<RarityConfig['limitBreaks'][100]>) => {
    const newConfig = {
      ...configs[rarity],
      limitBreaks: {
        ...configs[rarity].limitBreaks,
        [breakLevel]: { ...configs[rarity].limitBreaks[breakLevel], ...updates }
      }
    };
    setConfigs(prev => ({
      ...prev,
      [rarity]: newConfig
    }));
    // Immediately save to store for persistence
    updateRarityConfig(rarity, newConfig);
  };

  const exportConfigs = () => {
    const dataStr = JSON.stringify({ rarityConfigs: configs }, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rarity-configs-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetToDefaults = () => {
    if (confirm('Reset all rarity configurations to defaults? This cannot be undone.')) {
      resetRarityConfigs();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-gray-950 border border-gray-700 rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">Rarity Progression Editor</h2>
          <div className="flex gap-2">
            <button
              onClick={exportConfigs}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 border border-green-500 rounded text-white text-sm transition-all"
            >
              Export Configs
            </button>
            <button
              onClick={resetToDefaults}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 border border-orange-500 rounded text-white text-sm transition-all"
            >
              Reset to Defaults
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 border border-gray-500 rounded text-white text-sm transition-all"
            >
              Close
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Deprecation Notice */}
          <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded">
            <div className="text-sm text-yellow-400 font-medium mb-1">Legacy System</div>
            <div className="text-xs text-yellow-300/80">
              Cards with data-mined level tables use static per-level values and ignore rarity progression.
              This editor only affects custom cards without level table data.
            </div>
          </div>

          {/* Rarity Selection */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-white mb-3">Select Rarity to Edit</h3>
            <div className="flex flex-wrap gap-2">
              {rarityOrder.map(rarity => (
                <button
                  key={rarity}
                  onClick={() => setSelectedRarity(rarity)}
                  className={`px-4 py-2 rounded border capitalize font-medium transition-all ${
                    selectedRarity === rarity
                      ? 'border-white bg-white/10 text-white'
                      : 'border-gray-600 bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
                  }`}
                  style={{
                    color: selectedRarity === rarity ? getRarityColor(rarity) : undefined,
                    borderColor: selectedRarity === rarity ? getRarityColor(rarity) : undefined
                  }}
                >
                  {rarity}
                </button>
              ))}
            </div>
          </div>

          {/* Configuration Editor */}
          <div className="bg-gray-900/50 border border-gray-700/50 rounded p-4">
            <h4
              className="text-xl font-bold mb-4 capitalize"
              style={{ color: getRarityColor(selectedRarity) }}
            >
              {selectedRarity} Configuration
            </h4>

            {/* Base Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-white">Base ATK:</label>
                <LargeNumberInput
                  value={configs[selectedRarity].baseAtk}
                  onChange={(value) => updateConfig(selectedRarity, { baseAtk: value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white focus:border-blue-500 focus:outline-none"
                  min={0}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-white">Base HP:</label>
                <LargeNumberInput
                  value={configs[selectedRarity].baseHp}
                  onChange={(value) => updateConfig(selectedRarity, { baseHp: value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white focus:border-blue-500 focus:outline-none"
                  min={0}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-white">Growth Per Level (%):</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={configs[selectedRarity].growthPerLevel}
                  onChange={(e) => updateConfig(selectedRarity, { growthPerLevel: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Limit Break Static Values */}
            <div>
              <h5 className="text-lg font-bold text-white mb-3">Limit Break Static Values</h5>
              <div className="space-y-4">
                {([100, 120, 140, 160, 180] as const).map(breakLevel => (
                  <div key={breakLevel} className="bg-gray-800/50 border border-gray-600/50 rounded p-3">
                    <div className="flex items-center gap-4 mb-3">
                      <h6 className="text-md font-medium text-yellow-300">Level {breakLevel} Limit Break</h6>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1 text-gray-300">ATK Value:</label>
                        <LargeNumberInput
                          value={configs[selectedRarity].limitBreaks[breakLevel].atk}
                          onChange={(value) => updateLimitBreak(selectedRarity, breakLevel, {
                            atk: value
                          })}
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm focus:border-blue-500 focus:outline-none"
                          min={0}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1 text-gray-300">HP Value:</label>
                        <LargeNumberInput
                          value={configs[selectedRarity].limitBreaks[breakLevel].hp}
                          onChange={(value) => updateLimitBreak(selectedRarity, breakLevel, {
                            hp: value
                          })}
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm focus:border-blue-500 focus:outline-none"
                          min={0}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};