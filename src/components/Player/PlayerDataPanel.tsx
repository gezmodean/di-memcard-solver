import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import type { PlayerData } from '../../lib/types';
import { RARITY_ORDER } from '../../lib/types';
import { getIconPath } from '../../utils/assetPaths';

interface PlayerDataPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PlayerDataPanel: React.FC<PlayerDataPanelProps> = ({ isOpen, onClose }) => {
  const { pieces, updatePieceLevel, exportPlayerData, importPlayerData, playerData, unlockAllPieces } = useGameStore();
  const [activeSection, setActiveSection] = useState<'overview' | 'pieces'>('overview');

  if (!isOpen) return null;

  const handleExportPlayerData = () => {
    exportPlayerData();
  };

  const handleImportPlayerData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string) as PlayerData;
        importPlayerData(data);
        alert('Player data imported successfully!');
      } catch {
        alert('Error importing player data: Invalid file format');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const unlockedCount = pieces.filter(p => p.unlocked).length;
  const totalLevels = pieces.reduce((sum, p) => sum + p.level, 0);
  const avgLevel = pieces.length > 0 ? (totalLevels / pieces.length).toFixed(1) : '0';

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-gray-950 border border-gray-700 rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">My Memory Cards</h2>
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
              <h3 className="text-lg font-semibold text-white mb-4">My Data</h3>
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
                  onClick={() => setActiveSection('pieces')}
                  className={`w-full text-left px-3 py-2 rounded transition-all ${
                    activeSection === 'pieces'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  🎴 My Memory Cards
                </button>
              </nav>

              {/* Data Management */}
              <div className="mt-8">
                <h4 className="text-md font-semibold text-white mb-3">Data Management</h4>
                <div className="space-y-2">
                  <button
                    onClick={handleExportPlayerData}
                    className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 border border-blue-500 rounded text-white text-sm transition-all"
                  >
                    📤 Export My Data
                  </button>

                  <label className="w-full px-3 py-2 bg-orange-600 hover:bg-orange-700 border border-orange-500 rounded text-white text-sm transition-all cursor-pointer text-center block">
                    📥 Import My Data
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportPlayerData}
                      className="hidden"
                    />
                  </label>
                  <button
                    onClick={() => {
                      if (confirm('Unlock all memory cards? This will make all cards available for use.')) {
                        unlockAllPieces();
                        alert('All memory cards unlocked successfully!');
                      }
                    }}
                    className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 border border-green-500 rounded text-white text-sm transition-all"
                  >
                    🔓 Unlock All Cards
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6">
            {activeSection === 'overview' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-white">Collection Overview</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gray-800/50 border border-gray-600/50 rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-white mb-2">Collection</h4>
                    <div className="text-3xl font-bold text-green-400 mb-1">{unlockedCount}/{pieces.length}</div>
                    <div className="text-sm text-gray-400">Pieces unlocked</div>
                  </div>

                  <div className="bg-gray-800/50 border border-gray-600/50 rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-white mb-2">Average Level</h4>
                    <div className="text-3xl font-bold text-blue-400 mb-1">{avgLevel}</div>
                    <div className="text-sm text-gray-400">Across all pieces</div>
                  </div>

                  <div className="bg-gray-800/50 border border-gray-600/50 rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-white mb-2">Total Levels</h4>
                    <div className="text-3xl font-bold text-purple-400 mb-1">{totalLevels}</div>
                    <div className="text-sm text-gray-400">Combined levels</div>
                  </div>
                </div>

                <div className="bg-gray-800/50 border border-gray-600/50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-white mb-4">Data Management</h4>
                  <div className="text-gray-300 mb-4">
                    <p className="mb-2">Your memory card progress is stored locally in your browser. Use these tools to backup and restore your progress:</p>
                    <ul className="text-sm text-gray-400 space-y-1 ml-4">
                      <li>• Export saves your unlocked pieces, levels, and limit breaks</li>
                      <li>• Import restores your progress from a saved file</li>
                      <li>• Data is separate from the site configuration</li>
                    </ul>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      onClick={handleExportPlayerData}
                      className="px-4 py-3 bg-blue-600 hover:bg-blue-700 border border-blue-500 rounded text-white transition-all"
                    >
                      📤 Export My Progress
                    </button>

                    <label className="px-4 py-3 bg-orange-600 hover:bg-orange-700 border border-orange-500 rounded text-white transition-all cursor-pointer text-center">
                      📥 Import My Progress
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleImportPlayerData}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'pieces' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-white">My Memory Card Collection</h3>

                <div className="text-gray-300">
                  <p className="mb-4">Manage your personal collection of memory cards. Level up your pieces and unlock new ones as you progress.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pieces
                    .sort((a, b) => RARITY_ORDER[b.rarity] - RARITY_ORDER[a.rarity])
                    .map(piece => (
                    <div key={piece.id} className={`border rounded-lg p-4 transition-all ${
                      piece.unlocked
                        ? 'bg-gray-800/50 border-gray-600/50'
                        : 'bg-gray-900/50 border-gray-700/50 opacity-60'
                    }`}>
                      <div className="flex items-center gap-3 mb-3">
                        {piece.iconFile ? (
                          <img
                            src={getIconPath(piece.iconFile)}
                            alt={piece.name}
                            className="w-8 h-8 object-contain"
                          />
                        ) : (
                          <span className="text-lg">{piece.icon}</span>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-white truncate">{piece.name}</div>
                          <div className="text-sm text-gray-400 capitalize">{piece.rarity}</div>
                        </div>
                        <button
                          onClick={() => {
                            const existingPlayerPiece = playerData.pieces.find(p => p.id === piece.id);
                            const newPlayerPieces = playerData.pieces.filter(p => p.id !== piece.id);
                            if (existingPlayerPiece) {
                              newPlayerPieces.push({
                                ...existingPlayerPiece,
                                unlocked: !existingPlayerPiece.unlocked
                              });
                            } else {
                              newPlayerPieces.push({
                                id: piece.id,
                                level: 1,
                                limitBreaks: [],
                                unlocked: !piece.unlocked
                              });
                            }
                            const newPlayerData = { pieces: newPlayerPieces };
                            importPlayerData(newPlayerData);
                          }}
                          className={`px-2 py-1 rounded text-xs transition-colors ${
                            piece.unlocked
                              ? 'bg-green-600 hover:bg-green-700 text-white'
                              : 'bg-red-600 hover:bg-red-700 text-white'
                          }`}
                        >
                          {piece.unlocked ? '🔓' : '🔒'}
                        </button>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-300">Level:</span>
                          <input
                            type="number"
                            min={1}
                            max={200}
                            value={piece.level}
                            onChange={(e) => {
                              const level = parseInt(e.target.value) || 1;
                              updatePieceLevel(piece.id, level);
                            }}
                            disabled={!piece.unlocked}
                            className="w-16 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm text-white disabled:opacity-50"
                          />
                        </div>

                        <div className="space-y-1">
                          <span className="text-xs text-gray-300">Limit Breaks:</span>
                          <div className="grid grid-cols-5 gap-1">
                            {[100, 120, 140, 160, 180].map(breakLevel => (
                              <button
                                key={breakLevel}
                                onClick={() => {
                                  const currentBreaks = piece.limitBreaks || [];
                                  const existingPlayerPiece = playerData.pieces.find(p => p.id === piece.id);
                                  const newPlayerPieces = playerData.pieces.filter(p => p.id !== piece.id);

                                  let newBreaks;
                                  if (currentBreaks.includes(breakLevel)) {
                                    newBreaks = currentBreaks.filter(b => b !== breakLevel);
                                  } else {
                                    newBreaks = [...currentBreaks, breakLevel].sort((a, b) => a - b);
                                  }

                                  newPlayerPieces.push({
                                    id: piece.id,
                                    level: existingPlayerPiece?.level || piece.level,
                                    limitBreaks: newBreaks,
                                    unlocked: existingPlayerPiece?.unlocked ?? piece.unlocked
                                  });

                                  const newPlayerData = { pieces: newPlayerPieces };
                                  importPlayerData(newPlayerData);
                                }}
                                disabled={!piece.unlocked}
                                className={`text-xs px-1 py-0.5 rounded transition-colors disabled:opacity-50 ${
                                  piece.limitBreaks?.includes(breakLevel)
                                    ? 'bg-yellow-600 text-white'
                                    : 'bg-gray-600 hover:bg-gray-500 text-gray-300'
                                }`}
                              >
                                {breakLevel}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="text-xs text-gray-400">
                          <div>ATK: {piece.baseStats.atk} | HP: {piece.baseStats.hp}</div>
                        </div>
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
  );
};