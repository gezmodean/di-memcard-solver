import React, { useState } from 'react';
import { ShapeIconEditor } from './ShapeIconEditor';
import { IconPicker } from './IconPicker';
import { LargeNumberInput } from '../UI/LargeNumberInput';
import type { SpecialEffect } from '../../lib/types';
import { TabularSpecialEffectsEditor } from '../PieceEditor/TabularSpecialEffectsEditor';

interface PieceFormData {
  name: string;
  rarity: string;
  shape: number[][];
  iconFile: string;
  baseAtk: number;
  baseHp: number;
  specialEffects: SpecialEffect[];
}

interface PieceDataFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveData: (pieces: unknown[]) => void;
}

export const PieceDataForm: React.FC<PieceDataFormProps> = ({ isOpen, onClose, onSaveData }) => {
  const [pieces, setPieces] = useState<PieceFormData[]>([]);
  const [currentPiece, setCurrentPiece] = useState<PieceFormData>({
    name: '',
    rarity: 'common',
    shape: [[1, 1, 1, 1]], // Default I-tetromino shape
    iconFile: 'sprite-6-2.png',
    baseAtk: 50,
    baseHp: 30,
    specialEffects: []
  });


  const rarities = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic', 'transcendent'];
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

  const addPiece = () => {
    setPieces([...pieces, { ...currentPiece }]);
    setCurrentPiece({
      name: '',
      rarity: 'common',
      shape: [[1, 1, 1, 1]],
      iconFile: 'sprite-6-2.png',
      baseAtk: 50,
      baseHp: 30,
      specialEffects: []
    });

  };

  const removePiece = (index: number) => {
    setPieces(pieces.filter((_, i) => i !== index));
  };


  const saveAllData = () => {
    const formattedPieces = pieces.map((piece, index) => ({
      id: `custom_${Date.now()}_${index + 1}`,
      name: piece.name,
      rarity: piece.rarity,
      shape: piece.shape,
      iconFile: piece.iconFile,
      level: 1,
      baseStats: {
        atk: piece.baseAtk,
        hp: piece.baseHp
      },
      specialEffects: piece.specialEffects,
      unlocked: true
    }));

    onSaveData(formattedPieces);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50
    }}>
      <div style={{
        backgroundColor: '#0a0a0f',
        border: '1px solid #374151',
        borderRadius: '8px',
        padding: '24px',
        maxWidth: '1000px',
        width: '90%',
        maxHeight: '80vh',
        overflowY: 'auto',
        color: 'white'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0, color: '#f8fafc' }}>Input Real Piece Data</h2>
          <button
            onClick={onClose}
            style={{
              color: '#9ca3af',
              fontSize: '24px',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#9ca3af'}
          >×</button>
        </div>

        {/* Current Piece Form */}
        <div style={{
          marginBottom: '24px',
          padding: '16px',
          backgroundColor: '#1f2937',
          border: '1px solid #374151',
          borderRadius: '8px'
        }}>
          <h3 style={{ fontWeight: 'bold', marginBottom: '12px', fontSize: '1.1rem', color: '#f8fafc' }}>Add New Piece</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', marginBottom: '4px', color: '#d1d5db' }}>Piece Name:</label>
                <input
                  type="text"
                  value={currentPiece.name}
                  onChange={(e) => setCurrentPiece({...currentPiece, name: e.target.value})}
                  style={{
                    width: '100%',
                    backgroundColor: '#374151',
                    border: '1px solid #6b7280',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    color: 'white',
                    fontSize: '14px'
                  }}
                  placeholder="Enter piece name"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', marginBottom: '4px', color: '#d1d5db' }}>Rarity:</label>
                <select
                  value={currentPiece.rarity}
                  onChange={(e) => setCurrentPiece({...currentPiece, rarity: e.target.value})}
                  style={{
                    width: '100%',
                    backgroundColor: '#374151',
                    border: '1px solid #6b7280',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    color: 'white',
                    fontSize: '14px'
                  }}
                >
                  {rarities.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              <div>
                <IconPicker
                  selectedIcon={currentPiece.iconFile}
                  onSelect={(iconFile) => setCurrentPiece({...currentPiece, iconFile})}
                  availableIcons={availableIcons}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', marginBottom: '4px', color: '#d1d5db' }}>Base ATK:</label>
                  <LargeNumberInput
                    value={currentPiece.baseAtk}
                    onChange={(value) => setCurrentPiece({...currentPiece, baseAtk: value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm"
                    min={0}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', marginBottom: '4px', color: '#d1d5db' }}>Base HP:</label>
                  <LargeNumberInput
                    value={currentPiece.baseHp}
                    onChange={(value) => setCurrentPiece({...currentPiece, baseHp: value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm"
                    min={0}
                  />
                </div>
              </div>
            </div>

            {/* Special Effects Section */}
            <div>
              <TabularSpecialEffectsEditor
                effects={currentPiece.specialEffects}
                onChange={(effects) => setCurrentPiece({...currentPiece, specialEffects: effects})}
                maxLevel={200}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: '#d1d5db' }}>Piece Shape:</label>
              <ShapeIconEditor
                shape={currentPiece.shape}
                onChange={(newShape) => setCurrentPiece({...currentPiece, shape: newShape})}
                maxSize={7}
              />
            </div>
          </div>

          <button
            onClick={addPiece}
            disabled={!currentPiece.name}
            style={{
              marginTop: '12px',
              padding: '10px 16px',
              backgroundColor: !currentPiece.name ? '#4b5563' : '#2563eb',
              border: '1px solid #3b82f6',
              borderRadius: '6px',
              color: 'white',
              cursor: !currentPiece.name ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              if (currentPiece.name) {
                e.currentTarget.style.backgroundColor = '#3b82f6';
              }
            }}
            onMouseLeave={(e) => {
              if (currentPiece.name) {
                e.currentTarget.style.backgroundColor = '#2563eb';
              }
            }}
          >
            Add Piece
          </button>
        </div>

        {/* Pieces List */}
        <div style={{ marginBottom: '16px' }}>
          <h3 style={{ fontWeight: 'bold', marginBottom: '12px', fontSize: '1.1rem', color: '#f8fafc' }}>Added Pieces ({pieces.length})</h3>
          <div style={{ maxHeight: '160px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {pieces.map((piece, index) => (
              <div key={index} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                padding: '8px',
                borderRadius: '6px'
              }}>
                <span style={{ fontSize: '14px', color: '#d1d5db' }}>
                  {piece.name} ({piece.rarity}) - ATK: {piece.baseAtk}, HP: {piece.baseHp}
                </span>
                <button
                  onClick={() => removePiece(index)}
                  style={{
                    color: '#ef4444',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px 8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#dc2626'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#ef4444'}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={saveAllData}
            disabled={pieces.length === 0}
            style={{
              padding: '10px 16px',
              backgroundColor: pieces.length === 0 ? '#4b5563' : '#059669',
              border: '1px solid #10b981',
              borderRadius: '6px',
              color: 'white',
              cursor: pieces.length === 0 ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              if (pieces.length > 0) {
                e.currentTarget.style.backgroundColor = '#10b981';
              }
            }}
            onMouseLeave={(e) => {
              if (pieces.length > 0) {
                e.currentTarget.style.backgroundColor = '#059669';
              }
            }}
          >
            Save All Pieces ({pieces.length})
          </button>
          <button
            onClick={onClose}
            style={{
              padding: '10px 16px',
              backgroundColor: '#4b5563',
              border: '1px solid #6b7280',
              borderRadius: '6px',
              color: 'white',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#6b7280'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4b5563'}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};