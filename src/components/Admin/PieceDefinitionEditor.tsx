import React, { useState } from 'react';
import type { PieceDefinition, Rarity, SpecialEffect } from '../../lib/types';
import { RARITY_ORDER } from '../../lib/types';
import { useGameStore } from '../../store/gameStore';
import { ShapeIconEditor } from '../DataInput/ShapeIconEditor';
import { IconPicker } from '../DataInput/IconPicker';
import { LargeNumberInput } from '../UI/LargeNumberInput';
import { SpecialEffectEditor } from './SpecialEffectEditor';

interface PieceDefinitionEditorProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PieceDefinitionEditor: React.FC<PieceDefinitionEditorProps> = ({ isOpen, onClose }) => {
  const { pieces, updatePieceDefinition } = useGameStore();

  const [selectedPieceId, setSelectedPieceId] = useState<string | null>(null);
  const [editPieceData, setEditPieceData] = useState<PieceDefinition | null>(null);
  const [isSpecialEffectEditorOpen, setIsSpecialEffectEditorOpen] = useState(false);

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

  const rarities: Rarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic', 'transcendent'];

  const startEditingPiece = (piece: any) => {
    // Convert piece to PieceDefinition (exclude player data)
    const pieceDefinition: PieceDefinition = {
      id: piece.id,
      name: piece.name,
      rarity: piece.rarity,
      shape: piece.shape,
      color: piece.color,
      icon: piece.icon,
      iconFile: piece.iconFile,
      baseStats: piece.baseStats,
      useRarityProgression: piece.useRarityProgression,
      statGrowth: piece.statGrowth,
      specialEffects: piece.specialEffects
    };
    setEditPieceData(pieceDefinition);
    setSelectedPieceId(piece.id);
  };

  const saveEditedPiece = () => {
    if (!editPieceData) return;

    updatePieceDefinition(editPieceData);
    alert('Piece definition saved successfully!');

    setEditPieceData(null);
    setSelectedPieceId(null);
  };

  const cancelEdit = () => {
    setEditPieceData(null);
    setSelectedPieceId(null);
  };

  const handleSpecialEffectSave = (effect: SpecialEffect) => {
    if (!editPieceData) return;

    setEditPieceData({
      ...editPieceData,
      specialEffects: [effect]
    });
    setIsSpecialEffectEditorOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-gray-950 border border-gray-700 rounded-lg w-full max-w-7xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">Piece Definition Editor</h2>
          <div className="flex gap-3">
            <button
              onClick={() => {
                // TODO: Implement add new piece functionality
                console.log('Add new piece clicked');
              }}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 border border-green-500 rounded text-white text-sm transition-all"
            >
              ➕ Add New Piece
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 border border-gray-500 rounded text-white text-sm transition-all"
            >
              Close
            </button>
          </div>
        </div>

        <div className="flex">
          {/* Piece List Sidebar */}
          <div className="w-80 bg-gray-900 border-r border-gray-700 max-h-[calc(90vh-80px)] overflow-y-auto">
            <div className="p-4">
              <h3 className="text-lg font-semibold text-white mb-4">Memory Card Pieces</h3>
              <div className="text-sm text-gray-400 mb-4">
                Select a piece to edit its definition (shape, stats, effects, etc.)
              </div>

              <div className="space-y-2">
                {pieces
                  .sort((a, b) => RARITY_ORDER[b.rarity] - RARITY_ORDER[a.rarity])
                  .map(piece => (
                  <div
                    key={piece.id}
                    className={`p-3 border rounded cursor-pointer transition-all ${
                      selectedPieceId === piece.id
                        ? 'border-blue-500 bg-blue-900/20'
                        : 'border-gray-600 bg-gray-800/50 hover:bg-gray-700/50'
                    }`}
                    onClick={() => startEditingPiece(piece)}
                  >
                    <div className="flex items-center gap-3">
                      {piece.iconFile ? (
                        <img
                          src={`/icons/${piece.iconFile}`}
                          alt={piece.name}
                          className="w-8 h-8 object-contain"
                        />
                      ) : (
                        <span className="text-lg">{piece.icon}</span>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-white truncate">{piece.name}</div>
                        <div className="text-xs text-gray-400 capitalize">{piece.rarity}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Editor Panel */}
          <div className="flex-1 p-6">
            {!editPieceData ? (
              <div className="text-center text-gray-400 py-16">
                <div className="text-6xl mb-4">🎴</div>
                <div className="text-xl mb-2">Select a piece to edit</div>
                <div className="text-sm">Choose a memory card from the list to edit its definition</div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white">Editing: {editPieceData.name}</h3>
                  <div className="flex gap-3">
                    <button
                      onClick={cancelEdit}
                      className="px-4 py-2 bg-gray-600 hover:bg-gray-700 border border-gray-500 rounded text-white transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveEditedPiece}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 border border-blue-500 rounded text-white transition-all"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column - Basic Info */}
                  <div className="space-y-6">
                    {/* Basic Information */}
                    <div className="bg-gray-800/50 border border-gray-600/50 rounded-lg p-4">
                      <h4 className="text-lg font-semibold text-white mb-4">Basic Information</h4>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Piece Name:</label>
                          <input
                            type="text"
                            value={editPieceData.name}
                            onChange={(e) => setEditPieceData({...editPieceData, name: e.target.value})}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Rarity:</label>
                          <select
                            value={editPieceData.rarity}
                            onChange={(e) => setEditPieceData({...editPieceData, rarity: e.target.value as Rarity})}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                          >
                            {rarities.map(r => <option key={r} value={r}>{r}</option>)}
                          </select>
                        </div>

                        <div>
                          <IconPicker
                            selectedIcon={editPieceData.iconFile}
                            onSelect={(iconFile) => setEditPieceData({...editPieceData, iconFile})}
                            availableIcons={availableIcons}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Base Stats */}
                    <div className="bg-gray-800/50 border border-gray-600/50 rounded-lg p-4">
                      <h4 className="text-lg font-semibold text-white mb-4">Base Stats</h4>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Base ATK:</label>
                          <LargeNumberInput
                            value={editPieceData.baseStats.atk}
                            onChange={(value) => setEditPieceData({
                              ...editPieceData,
                              baseStats: {...editPieceData.baseStats, atk: value}
                            })}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                            min={0}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Base HP:</label>
                          <LargeNumberInput
                            value={editPieceData.baseStats.hp}
                            onChange={(value) => setEditPieceData({
                              ...editPieceData,
                              baseStats: {...editPieceData.baseStats, hp: value}
                            })}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                            min={0}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Shape Editor */}
                    <div className="bg-gray-800/50 border border-gray-600/50 rounded-lg p-4">
                      <h4 className="text-lg font-semibold text-white mb-4">Piece Shape</h4>
                      <ShapeIconEditor
                        shape={editPieceData.shape}
                        onShapeChange={(shape) => setEditPieceData({...editPieceData, shape})}
                        maxSize={{ width: 5, height: 5 }}
                      />
                    </div>
                  </div>

                  {/* Right Column - Special Effects */}
                  <div className="space-y-6">
                    <div className="bg-gray-800/50 border border-gray-600/50 rounded-lg p-4">
                      <h4 className="text-lg font-semibold text-white mb-4">Special Effect</h4>
                      {editPieceData.specialEffects && editPieceData.specialEffects.length > 0 ? (
                        <div className="space-y-3">
                          <div className="bg-gray-700/50 rounded p-3">
                            <div className="text-sm text-gray-300 mb-2">Current Effect:</div>
                            <div className="text-white mb-2">{editPieceData.specialEffects[0].description}</div>
                            <div className="text-xs text-gray-400">
                              Variables: {editPieceData.specialEffects[0].variables?.map(v => v.name).join(', ') || 'None'}
                            </div>
                          </div>
                          <button
                            onClick={() => setIsSpecialEffectEditorOpen(true)}
                            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 border border-blue-500 rounded text-white transition-all"
                          >
                            ✏️ Edit Effect
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="text-gray-400 text-center py-8">
                            No special effect configured
                          </div>
                          <button
                            onClick={() => setIsSpecialEffectEditorOpen(true)}
                            className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 border border-green-500 rounded text-white transition-all"
                          >
                            ➕ Add Effect
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Special Effect Editor Modal */}
      <SpecialEffectEditor
        isOpen={isSpecialEffectEditorOpen}
        onClose={() => setIsSpecialEffectEditorOpen(false)}
        effect={editPieceData?.specialEffects?.[0]}
        onSave={handleSpecialEffectSave}
      />
    </div>
  );
};