import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { RarityProgressionEditor } from '../PieceEditor/RarityProgressionEditor';
import { PieceDefinitionEditor } from './PieceDefinitionEditor';
import type { SiteConfig } from '../../lib/types';

interface SiteConfigurationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SiteConfigurationPanel: React.FC<SiteConfigurationPanelProps> = ({ isOpen, onClose }) => {
  const { pieces, rarityConfigs, resetToOriginalSiteConfig, resetRarityConfigs, exportSiteConfig, importSiteConfig } = useGameStore();
  const [activeSection, setActiveSection] = useState<'overview' | 'rarity'>('overview');
  const [isRarityEditorOpen, setIsRarityEditorOpen] = useState(false);
  const [isPieceEditorOpen, setIsPieceEditorOpen] = useState(false);

  if (!isOpen) return null;

  const handleExportSiteConfig = () => {
    exportSiteConfig();
  };

  const handleImportSiteConfig = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const config = JSON.parse(e.target?.result as string) as SiteConfig;
        importSiteConfig(config);
        alert('Site configuration imported successfully!');
      } catch {
        alert('Error importing site configuration: Invalid file format');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleResetToOriginal = async () => {
    if (confirm('Reset to original site configuration? This will restore all pieces and rarity settings to their defaults. This cannot be undone.')) {
      await resetToOriginalSiteConfig();
      resetRarityConfigs();
      alert('Site configuration reset to original successfully!');
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div className="bg-gray-950 border border-gray-700 rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-700">
            <h2 className="text-2xl font-bold text-white">Site Configuration</h2>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 border border-gray-500 rounded text-white text-sm transition-all"
            >
              Close
            </button>
          </div>

          <div className="flex">
            {/* Sidebar */}
            <div className="w-64 bg-gray-900 border-r border-gray-700">
              <div className="p-4">
                <h3 className="text-lg font-semibold text-white mb-4">Admin Tools</h3>
                <nav className="space-y-2">
                  <button
                    onClick={() => setActiveSection('overview')}
                    className={`w-full text-left px-3 py-2 rounded transition-all ${
                      activeSection === 'overview'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-gray-800'
                    }`}
                  >
                    📊 Overview
                  </button>
                  <button
                    onClick={() => setIsPieceEditorOpen(true)}
                    className="w-full text-left px-3 py-2 rounded transition-all text-gray-300 hover:bg-gray-800"
                  >
                    🎴 Manage Pieces
                  </button>
                  <button
                    onClick={() => setActiveSection('rarity')}
                    className={`w-full text-left px-3 py-2 rounded transition-all ${
                      activeSection === 'rarity'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-gray-800'
                    }`}
                  >
                    ⭐ Rarity Settings
                  </button>
                </nav>

              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6">
              {activeSection === 'overview' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-white">Site Configuration Overview</h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gray-800/50 border border-gray-600/50 rounded-lg p-4">
                      <h4 className="text-lg font-semibold text-white mb-2">Memory Pieces</h4>
                      <div className="text-3xl font-bold text-blue-400 mb-1">{pieces.length}</div>
                      <div className="text-sm text-gray-400">Total pieces configured</div>
                    </div>

                    <div className="bg-gray-800/50 border border-gray-600/50 rounded-lg p-4">
                      <h4 className="text-lg font-semibold text-white mb-2">Rarity Tiers</h4>
                      <div className="text-3xl font-bold text-purple-400 mb-1">{Object.keys(rarityConfigs).length}</div>
                      <div className="text-sm text-gray-400">Configured rarities</div>
                    </div>

                    <div className="bg-gray-800/50 border border-gray-600/50 rounded-lg p-4">
                      <h4 className="text-lg font-semibold text-white mb-2">Special Effects</h4>
                      <div className="text-3xl font-bold text-green-400 mb-1">
                        {pieces.reduce((count, p) => count + (p.specialEffects?.length || 0), 0)}
                      </div>
                      <div className="text-sm text-gray-400">Total special effects</div>
                    </div>
                  </div>

                  <div className="bg-gray-800/50 border border-gray-600/50 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-white mb-4">Configuration Management</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <button
                        onClick={handleExportSiteConfig}
                        className="px-4 py-3 bg-blue-600 hover:bg-blue-700 border border-blue-500 rounded text-white transition-all"
                      >
                        📤 Export Site Config
                      </button>

                      <label className="px-4 py-3 bg-orange-600 hover:bg-orange-700 border border-orange-500 rounded text-white transition-all cursor-pointer text-center">
                        📥 Import Site Config
                        <input
                          type="file"
                          accept=".json"
                          onChange={handleImportSiteConfig}
                          className="hidden"
                        />
                      </label>

                      <button
                        onClick={handleResetToOriginal}
                        className="px-4 py-3 bg-red-600 hover:bg-red-700 border border-red-500 rounded text-white transition-all"
                      >
                        🔄 Reset to Original
                      </button>
                    </div>
                  </div>
                </div>
              )}


              {activeSection === 'rarity' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white">Rarity Progression Settings</h3>
                    <button
                      onClick={() => setIsRarityEditorOpen(true)}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 border border-purple-500 rounded text-white transition-all"
                    >
                      ⚙️ Edit Progression
                    </button>
                  </div>

                  <div className="text-gray-300">
                    <p className="mb-4">Configure how pieces of different rarities progress in terms of stats and limit breaks.</p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                    {Object.entries(rarityConfigs).map(([rarity, config]) => (
                      <div key={rarity} className="bg-gray-800/50 border border-gray-600/50 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-white mb-2 capitalize">{rarity}</h4>
                        <div className="text-xs text-gray-400 space-y-1">
                          <div>Base ATK: {config.baseAtk}</div>
                          <div>Base HP: {config.baseHp}</div>
                          <div>Growth: {config.growthPerLevel}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Rarity Progression Editor Modal */}
      <RarityProgressionEditor
        isOpen={isRarityEditorOpen}
        onClose={() => setIsRarityEditorOpen(false)}
      />


      {/* Piece Definition Editor Modal */}
      <PieceDefinitionEditor
        isOpen={isPieceEditorOpen}
        onClose={() => setIsPieceEditorOpen(false)}
      />
    </>
  );
};