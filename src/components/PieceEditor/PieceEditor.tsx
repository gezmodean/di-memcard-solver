import React, { useState } from 'react';
import type { Piece, Rarity, SpecialEffect } from '../../lib/types';
import { useGameStore } from '../../store/gameStore';
import { ShapeIconEditor } from '../DataInput/ShapeIconEditor';
import { IconPicker } from '../DataInput/IconPicker';
import { RarityProgressionEditor } from './RarityProgressionEditor';
import { getIconPath } from '../../utils/assetPaths';
import { parseSpecialEffectTemplate } from '../../lib/utils/specialEffects';
import { RARITY_CONFIGS } from '../../lib/pieces/rarityProgression';

interface PieceEditorProps {
  isOpen: boolean;
  onClose: () => void;
  piece?: Piece;
  onOpenDataForm?: () => void;
}

export const PieceEditor: React.FC<PieceEditorProps> = ({ isOpen, onClose, onOpenDataForm }) => {
  const { pieces, togglePieceLock, savePiecesToJSON, resetPiecesToOriginal } = useGameStore();

  const [bulkLevel, setBulkLevel] = useState<number>(1);
  const [editingPieceId, setEditingPieceId] = useState<string | null>(null);
  const [editPieceData, setEditPieceData] = useState<Piece | null>(null);
  const [isRarityEditorOpen, setIsRarityEditorOpen] = useState(false);

  // Special effect editing state
  const [newEffectTemplate, setNewEffectTemplate] = useState('');
  const [newEffectVariables, setNewEffectVariables] = useState<{[key: string]: {baseValue: number; valuePerLevel: number; maxLevel: number}}>({});
  const [newEffectRequiresField, setNewEffectRequiresField] = useState(true);

  const availableIcons = [
    'sprite-3-2.png', 'sprite-4-5.png', 'sprite-6-2.png', 'sprite-10-3.png',
    'sprite-10-4.png', 'sprite-16-1.png', 'sprite-17-4.png', 'sprite-19-3.png',
    'sprite-24-1.png', 'sprite-24-2.png', 'sprite-24-3.png', 'sprite-24-4.png',
    'sprite-25-1.png', 'sprite-26-3.png', 'sprite-27-4.png', 'sprite-27-5.png',
    'sprite-27-6.png', 'sprite-29-1.png', 'sprite-29-2.png', 'sprite-29-3.png',
    'sprite-29-4.png', 'sprite-31-1.png', 'sprite-31-2.png', 'sprite-31-3.png',
    'sprite-31-4.png', 'sprite-31-5.png', 'sprite-33-2.png', 'sprite-33-3.png',
    'sprite-33-4.png', 'sprite-33-5.png', 'sprite-33-6.png', 'sprite-34-2.png',
    'sprite-34-3.png', 'sprite-34-4.png', 'sprite-34-5.png', 'sprite-34-6.png',
    'sprite-34-7.png'
  ];

  const rarities = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic', 'transcendent'];

  if (!isOpen) return null;

  const handleBulkLevelUpdate = () => {
    pieces.forEach(p => {
      if (p.unlocked) {
        useGameStore.getState().updatePieceLevel(p.id, bulkLevel);
      }
    });
  };

  const handleToggleLock = (pieceId: string) => {
    togglePieceLock(pieceId);
  };

  const startEditingPiece = (piece: Piece) => {
    setEditingPieceId(piece.id);
    setEditPieceData(JSON.parse(JSON.stringify(piece))); // Deep copy
    // Reset effect form
    setNewEffectTemplate('');
    setNewEffectVariables({});
    setNewEffectRequiresField(true);
  };

  const cancelEditingPiece = () => {
    setEditingPieceId(null);
    setEditPieceData(null);
    setNewEffectTemplate('');
    setNewEffectVariables({});
    setNewEffectRequiresField(true);
  };

  const saveEditedPiece = async () => {
    if (!editPieceData) return;

    // Update the piece in the store (automatically saves to localStorage)
    useGameStore.getState().updatePieceData(editPieceData);

    cancelEditingPiece();
    alert('Piece saved successfully! Changes are automatically persisted.');
  };

  const addSpecialEffectToEdit = () => {
    if (!newEffectTemplate.trim() || !editPieceData) return;

    const parsed = parseSpecialEffectTemplate(newEffectTemplate);
    const variables = parsed.variables.map(varName => {
      const varConfig = newEffectVariables[varName] || { baseValue: 1, valuePerLevel: 0, maxLevel: 200 };
      return {
        name: varName,
        baseValue: varConfig.baseValue,
        valuePerLevel: varConfig.valuePerLevel,
        maxLevel: varConfig.maxLevel
      };
    });

    const newEffect: SpecialEffect = {
      description: newEffectTemplate,
      variables,
      requiresOnField: newEffectRequiresField
    };

    const updatedEffects = [...(editPieceData.specialEffects || []), newEffect];
    setEditPieceData({
      ...editPieceData,
      specialEffects: updatedEffects
    });

    // Reset form
    setNewEffectTemplate('');
    setNewEffectVariables({});
    setNewEffectRequiresField(true);
  };

  const removeSpecialEffectFromEdit = (index: number) => {
    if (!editPieceData) return;

    const updatedEffects = (editPieceData.specialEffects || []).filter((_, i) => i !== index);
    setEditPieceData({
      ...editPieceData,
      specialEffects: updatedEffects
    });
  };

  const handleEffectTemplateChange = (template: string) => {
    setNewEffectTemplate(template);
    const parsed = parseSpecialEffectTemplate(template);

    // Initialize variables with default values
    const newVars: {[key: string]: {baseValue: number; valuePerLevel: number; maxLevel: number}} = {};
    parsed.variables.forEach(varName => {
      newVars[varName] = newEffectVariables[varName] || { baseValue: 1, valuePerLevel: 0, maxLevel: 200 };
    });
    setNewEffectVariables(newVars);
  };

  const exportConfiguration = () => {
    const config = {
      pieces: pieces.map(p => ({
        id: p.id,
        level: p.level,
        unlocked: p.unlocked
      })),
      timestamp: Date.now()
    };

    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `memsolver-config-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importConfiguration = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const config = JSON.parse(e.target?.result as string);
        config.pieces.forEach((configPiece: unknown) => {
          const piece = configPiece as Record<string, unknown>;
          useGameStore.getState().updatePieceLevel(piece.id as string, piece.level as number);
          if (piece.unlocked !== undefined) {
            const foundPiece = pieces.find(p => p.id === piece.id);
            if (foundPiece && foundPiece.unlocked !== piece.unlocked) {
              useGameStore.getState().togglePieceLock(piece.id as string);
            }
          }
        });
        alert('Configuration imported successfully!');
      } catch {
        alert('Error importing configuration: Invalid file format');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Piece Configuration</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        {/* Bulk Operations */}
        <div className="mb-6 p-4 bg-gray-700 rounded">
          <h3 className="font-bold mb-3">Bulk Operations</h3>
          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-2">
              <label>Set all unlocked pieces to level:</label>
              <input
                type="number"
                min={1}
                max={200}
                value={bulkLevel}
                onChange={(e) => setBulkLevel(parseInt(e.target.value) || 1)}
                className="w-16 bg-gray-600 border border-gray-500 rounded px-2 py-1"
              />
              <button
                onClick={handleBulkLevelUpdate}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded transition-colors"
              >
                Apply
              </button>
            </div>
          </div>

          <div className="mt-3 flex gap-2 flex-wrap">
            {onOpenDataForm && (
              <button
                onClick={onOpenDataForm}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded transition-colors"
              >
                Add New Piece
              </button>
            )}
            <button
              onClick={() => setIsRarityEditorOpen(true)}
              className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded transition-colors"
            >
              Edit Rarity Progression
            </button>
            <button
              onClick={exportConfiguration}
              className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded transition-colors"
            >
              Export Config
            </button>
            <label className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded transition-colors cursor-pointer">
              Import Config
              <input
                type="file"
                accept=".json"
                onChange={importConfiguration}
                className="hidden"
              />
            </label>
            <button
              onClick={async () => {
                await savePiecesToJSON();
                alert('Pieces exported to download! This is optional - changes are already saved automatically.');
              }}
              className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 rounded transition-colors"
            >
              Export Backup JSON (Optional)
            </button>
            <button
              onClick={async () => {
                if (confirm('Reset all pieces to original state? This will lose all custom edits!')) {
                  await resetPiecesToOriginal();
                  alert('Pieces reset to original state successfully!');
                }
              }}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded transition-colors"
            >
              Reset to Original
            </button>
          </div>
        </div>

        {/* Piece List - Grouped by Rarity */}
        <div className="space-y-4">
          {(() => {
            // Group pieces by rarity
            const groupedPieces = pieces.reduce((groups, piece) => {
              if (!groups[piece.rarity]) {
                groups[piece.rarity] = [];
              }
              groups[piece.rarity].push(piece);
              return groups;
            }, {} as Record<string, typeof pieces>);

            const rarityOrder = ['transcendent', 'mythic', 'legendary', 'epic', 'rare', 'uncommon', 'common'];

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

            return rarityOrder.map(rarity => {
              const piecesInRarity = groupedPieces[rarity] || [];
              if (piecesInRarity.length === 0) return null;

              // Sort pieces within rarity by name
              const sortedPieces = piecesInRarity.sort((a, b) => a.name.localeCompare(b.name));

              return (
                <div key={rarity}>
                  {/* Rarity Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className="text-sm font-bold capitalize px-3 py-2 rounded border"
                      style={{
                        color: getRarityColor(rarity),
                        borderColor: getRarityColor(rarity) + '40',
                        backgroundColor: getRarityColor(rarity) + '10'
                      }}
                    >
                      {rarity}
                    </div>
                    <span className="text-xs text-gray-400">({sortedPieces.length})</span>
                  </div>

                  {/* Pieces Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-2">
                    {sortedPieces.map(piece => (
            <div
              key={piece.id}
              className={`
                p-3 rounded border-2 transition-all
                ${piece.unlocked ? 'bg-gray-700 border-gray-600' : 'bg-gray-800 border-gray-700 opacity-60'}
              `}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {piece.iconFile ? (
                    <img
                      src={getIconPath(piece.iconFile)}
                      alt={piece.name}
                      className="w-8 h-8 object-contain"
                    />
                  ) : (
                    <span className="text-xl">{piece.icon}</span>
                  )}
                  <div>
                    <div className="font-medium text-sm">{piece.name}</div>
                    <div className="text-xs text-gray-400 capitalize">{piece.rarity}</div>
                  </div>
                </div>
                <button
                  onClick={() => handleToggleLock(piece.id)}
                  className={`
                    px-2 py-1 rounded text-xs transition-colors
                    ${piece.unlocked
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-red-600 hover:bg-red-700 text-white'
                    }
                  `}
                >
                  {piece.unlocked ? 'Unlock' : 'Lock'}
                </button>
              </div>

              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">Level:</span>
                <input
                  type="number"
                  min={1}
                  max={200}
                  value={piece.level}
                  onChange={(e) => {
                    const level = parseInt(e.target.value) || 1;
                    useGameStore.getState().updatePieceLevel(piece.id, level);
                  }}
                  disabled={!piece.unlocked}
                  className="w-16 bg-gray-600 border border-gray-500 rounded px-2 py-1 text-sm disabled:opacity-50"
                />
              </div>

              <button
                onClick={() => startEditingPiece(piece)}
                className="w-full px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs transition-colors"
              >
                Edit Piece Details
              </button>
            </div>
                    ))}
                  </div>
                </div>
              );
            }).filter(Boolean);
          })()}
        </div>
      </div>

      {/* Detailed Piece Edit Modal */}
      {editingPieceId && editPieceData && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-60">
          <div className="bg-gray-800 rounded-lg p-6 max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Edit: {editPieceData.name}</h3>
              <button
                onClick={cancelEditingPiece}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Basic Info */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name:</label>
                  <input
                    type="text"
                    value={editPieceData.name}
                    onChange={(e) => setEditPieceData({...editPieceData, name: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Rarity:</label>
                  <select
                    value={editPieceData.rarity}
                    onChange={(e) => setEditPieceData({...editPieceData, rarity: e.target.value as Rarity})}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                  >
                    {rarities.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Base ATK (from rarity):</label>
                    <div className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-gray-300">
                      {RARITY_CONFIGS[editPieceData.rarity]?.baseAtk || 'Unknown'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Base HP (from rarity):</label>
                    <div className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-gray-300">
                      {RARITY_CONFIGS[editPieceData.rarity]?.baseHp || 'Unknown'}
                    </div>
                  </div>
                </div>



                <div>
                  <IconPicker
                    selectedIcon={editPieceData.iconFile || 'sprite-6-2.png'}
                    onSelect={(iconFile) => setEditPieceData({...editPieceData, iconFile})}
                    availableIcons={availableIcons}
                  />
                </div>

                {/* Special Effects */}
                <div>
                  <label className="block text-sm font-medium mb-2">Special Effects:</label>

                  {/* Current Effects */}
                  <div className="space-y-2 mb-4">
                    {(editPieceData.specialEffects || []).map((effect, index) => (
                      <div key={index} className="flex justify-between items-start bg-gray-700 border border-gray-600 p-2 rounded">
                        <div className="flex-1">
                          <div className="text-sm">{effect.description}</div>
                          <div className="text-xs text-gray-400">
                            Variables: {effect.variables.map(v => {
                              const baseValue = v.baseValue ?? v.value ?? 0;
                              const valuePerLevel = v.valuePerLevel ?? 0;
                              const maxLevel = v.maxLevel ?? 200;
                              const currentLevel = editPieceData?.level || 1;
                              const effectiveLevel = Math.min(currentLevel, maxLevel);
                              const currentValue = baseValue + (valuePerLevel * Math.max(0, effectiveLevel - 1));

                              return valuePerLevel > 0
                                ? `${v.name}=${currentValue.toFixed(1)} (${baseValue}+${valuePerLevel}/lv, max lv${maxLevel})`
                                : `${v.name}=${baseValue}`;
                            }).join(', ')}
                            {effect.requiresOnField === false && ' (Always Active)'}
                          </div>
                        </div>
                        <button
                          onClick={() => removeSpecialEffectFromEdit(index)}
                          className="text-red-400 hover:text-red-300 ml-2"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add New Effect */}
                  <div className="bg-gray-700 border border-gray-600 p-3 rounded">
                    <div className="mb-2">
                      <label className="block text-xs font-medium mb-1">Effect Template:</label>
                      <input
                        type="text"
                        value={newEffectTemplate}
                        onChange={(e) => handleEffectTemplateChange(e.target.value)}
                        placeholder="e.g., skill cooldown decreases by {cooldown}%"
                        className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm"
                      />
                    </div>

                    {Object.keys(newEffectVariables).length > 0 && (
                      <div className="mb-2">
                        <label className="block text-xs font-medium mb-1">Variables (Level Scaling):</label>
                        <div className="space-y-3">
                          {Object.entries(newEffectVariables).map(([varName, config]) => (
                            <div key={varName} className="bg-gray-700/50 border border-gray-600/50 rounded p-2">
                              <div className="text-xs font-medium text-yellow-300 mb-2">{varName}</div>
                              <div className="grid grid-cols-3 gap-2">
                                <div>
                                  <label className="block text-xs text-gray-400 mb-1">Base Value (Lv1):</label>
                                  <input
                                    type="number"
                                    step="0.1"
                                    value={config.baseValue}
                                    onChange={(e) => setNewEffectVariables({
                                      ...newEffectVariables,
                                      [varName]: { ...config, baseValue: parseFloat(e.target.value) || 0 }
                                    })}
                                    className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-xs"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs text-gray-400 mb-1">Per Level:</label>
                                  <input
                                    type="number"
                                    step="0.01"
                                    value={config.valuePerLevel}
                                    onChange={(e) => setNewEffectVariables({
                                      ...newEffectVariables,
                                      [varName]: { ...config, valuePerLevel: parseFloat(e.target.value) || 0 }
                                    })}
                                    className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-xs"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs text-gray-400 mb-1">Max Level:</label>
                                  <input
                                    type="number"
                                    min="1"
                                    max="200"
                                    value={config.maxLevel}
                                    onChange={(e) => setNewEffectVariables({
                                      ...newEffectVariables,
                                      [varName]: { ...config, maxLevel: Math.max(1, Math.min(200, parseInt(e.target.value) || 200)) }
                                    })}
                                    className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-xs"
                                  />
                                </div>
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                At level {editPieceData?.level || 1}: {(config.baseValue + (config.valuePerLevel * Math.max(0, Math.min((editPieceData?.level || 1), config.maxLevel) - 1))).toFixed(1)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-4 mb-2">
                      <label className="flex items-center gap-2 text-xs">
                        <input
                          type="checkbox"
                          checked={newEffectRequiresField}
                          onChange={(e) => setNewEffectRequiresField(e.target.checked)}
                        />
                        Only active on field
                      </label>
                    </div>

                    <button
                      onClick={addSpecialEffectToEdit}
                      disabled={!newEffectTemplate.trim()}
                      className="px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:text-gray-500 rounded text-xs transition-colors"
                    >
                      Add Effect
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column - Shape Editor */}
              <div>
                <label className="block text-sm font-medium mb-2">Piece Shape:</label>
                <ShapeIconEditor
                  shape={editPieceData.shape}
                  onChange={(newShape) => setEditPieceData({...editPieceData, shape: newShape})}
                  maxSize={7}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6 pt-4 border-t border-gray-700">
              <button
                onClick={saveEditedPiece}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded transition-colors"
              >
                Save Changes
              </button>
              <button
                onClick={cancelEditingPiece}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rarity Progression Editor */}
      <RarityProgressionEditor
        isOpen={isRarityEditorOpen}
        onClose={() => setIsRarityEditorOpen(false)}
      />
    </div>
  );
};