import React, { useState, useEffect } from 'react';
import type { SpecialEffect, SpecialEffectVariable } from '../../lib/types';
import { LargeNumberInput } from '../UI/LargeNumberInput';
import { formatLargeNumber } from '../../lib/utils/numberFormat';


interface SpecialEffectEditorProps {
  isOpen: boolean;
  onClose: () => void;
  effect?: SpecialEffect;
  onSave: (effect: SpecialEffect) => void;
}

export const SpecialEffectEditor: React.FC<SpecialEffectEditorProps> = ({
  isOpen,
  onClose,
  effect,
  onSave
}) => {
  const [description, setDescription] = useState('');
  const [variables, setVariables] = useState<SpecialEffectVariable[]>([]);
  const [viewMode, setViewMode] = useState<'simple' | 'detailed'>('simple');

  // Key levels for simple view
  const keyLevels = [1, 100, 120, 140, 160, 180, 200];

  useEffect(() => {
    if (effect) {
      setDescription(effect.description);
      setVariables(effect.variables || []);
    } else {
      setDescription('');
      setVariables([]);
    }
  }, [effect]);

  if (!isOpen) return null;

  const extractVariablesFromDescription = () => {
    const regex = /\{(\w+)\}/g;
    const foundVariables = new Set<string>();
    let match;

    while ((match = regex.exec(description)) !== null) {
      foundVariables.add(match[1]);
    }

    const newVariables: SpecialEffectVariable[] = Array.from(foundVariables).map(name => {
      const existing = variables.find(v => v.name === name);
      return existing || {
        name,
        baseValue: 0,
        valuePerLevel: 0,
        maxLevel: 200
      };
    });

    setVariables(newVariables);
  };

  const updateVariable = (index: number, field: keyof SpecialEffectVariable, value: number | string | Record<number, number>) => {
    const newVariables = [...variables];
    if (field === 'name') {
      newVariables[index] = { ...newVariables[index], [field]: value as string };
    } else if (field === 'keyValues') {
      newVariables[index] = { ...newVariables[index], [field]: value as Record<number, number> };
    } else {
      newVariables[index] = { ...newVariables[index], [field]: value as number };
    }
    setVariables(newVariables);
  };

  const calculateValueAtLevel = (variable: SpecialEffectVariable, level: number): number => {
    // If we have keyValues stored in the variable, use piecewise linear interpolation
    if (variable.keyValues && Object.keys(variable.keyValues).length > 0) {
      return calculatePiecewiseValue(variable.keyValues, level);
    }

    // Otherwise use the original linear formula
    const maxLvl = variable.maxLevel || 200;
    const effectiveLevel = Math.min(level, maxLvl);
    const valuePerLevel = variable.valuePerLevel || 0;
    return variable.baseValue + (effectiveLevel - 1) * valuePerLevel;
  };

  const formatToSigFigs = (value: number, sigFigs: number = 2): number => {
    if (value === 0) return 0;
    // For very large numbers, maintain more precision to avoid loss
    if (Math.abs(value) >= 1e15) {
      return value; // Keep full precision for very large numbers
    }
    const magnitude = Math.floor(Math.log10(Math.abs(value)));
    const factor = Math.pow(10, sigFigs - 1 - magnitude);
    return Math.round(value * factor) / factor;
  };

  const calculatePiecewiseValue = (keyValues: Record<number, number>, level: number): number => {
    const levels = Object.keys(keyValues).map(Number).sort((a, b) => a - b);

    // If level is at or below the first key level, return that value
    if (level <= levels[0]) {
      return keyValues[levels[0]];
    }

    // If level is at or above the last key level, return that value
    if (level >= levels[levels.length - 1]) {
      return keyValues[levels[levels.length - 1]];
    }

    // Find the two key levels that bracket this level
    for (let i = 0; i < levels.length - 1; i++) {
      const level1 = levels[i];
      const level2 = levels[i + 1];

      if (level >= level1 && level <= level2) {
        const value1 = keyValues[level1];
        const value2 = keyValues[level2];

        // Linear interpolation between the two points
        const ratio = (level - level1) / (level2 - level1);
        const interpolatedValue = value1 + ratio * (value2 - value1);

        // For large numbers, preserve more precision
        if (Math.abs(interpolatedValue) >= 1e12) {
          return interpolatedValue; // Keep full precision for very large numbers
        }
        // Round to 2 significant figures for smaller numbers
        return formatToSigFigs(interpolatedValue, 2);
      }
    }

    // Fallback (shouldn't reach here)
    return keyValues[levels[0]] || 0;
  };

  const interpolateValues = (variable: SpecialEffectVariable, keyValues: Record<number, number>) => {
    const newVar = { ...variable };

    // Store the exact keyValues for piecewise interpolation - don't modify them!
    newVar.keyValues = { ...keyValues };

    // For backward compatibility, set baseValue from level 1 if available
    if (keyValues[1] !== undefined) {
      newVar.baseValue = keyValues[1];
    }

    // Set valuePerLevel to 0 since we're using piecewise interpolation
    newVar.valuePerLevel = 0;
    newVar.maxLevel = 200;

    return newVar;
  };

  const handleSave = () => {
    const newEffect: SpecialEffect = {
      description,
      variables,
      requiresOnField: true
    };
    onSave(newEffect);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-gray-950 border border-gray-700 rounded-lg w-full max-w-7xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">Special Effect Editor</h2>
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 border border-green-500 rounded text-white text-sm transition-all"
            >
              💾 Save Effect
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 border border-gray-500 rounded text-white text-sm transition-all"
            >
              Close
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Description Template */}
          <div className="bg-gray-800/50 border border-gray-600/50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4">Effect Description Template</h3>
            <div className="space-y-3">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter effect description with variables in {braces}, e.g., 'Increases damage by {damage}% and reduces cooldown by {cooldown} seconds'"
                className="w-full h-24 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-400 resize-none"
              />
              <button
                onClick={extractVariablesFromDescription}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 border border-blue-500 rounded text-white text-sm transition-all"
              >
                🔄 Update Variables from Description
              </button>
            </div>
          </div>

          {/* Variables Configuration */}
          {variables.length > 0 && (
            <div className="bg-gray-800/50 border border-gray-600/50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white">Variable Configuration</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewMode('simple')}
                    className={`px-3 py-1 rounded text-sm transition-all ${
                      viewMode === 'simple'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-600 hover:bg-gray-500 text-gray-300'
                    }`}
                  >
                    Simple View
                  </button>
                  <button
                    onClick={() => {
                      // Ensure all variables have full keyValues when switching to detailed view
                      const newVariables = variables.map((variable) => {
                        if (!variable.keyValues || Object.keys(variable.keyValues).length < 200) {
                          const newKeyValues: Record<number, number> = {};
                          for (let level = 1; level <= 200; level++) {
                            newKeyValues[level] = variable.keyValues?.[level] !== undefined
                              ? variable.keyValues[level]
                              : calculateValueAtLevel(variable, level);
                          }
                          return {
                            ...variable,
                            keyValues: newKeyValues,
                            valuePerLevel: 0,
                            maxLevel: 200
                          };
                        }
                        return variable;
                      });
                      setVariables(newVariables);
                      setViewMode('detailed');
                    }}
                    className={`px-3 py-1 rounded text-sm transition-all ${
                      viewMode === 'detailed'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-600 hover:bg-gray-500 text-gray-300'
                    }`}
                  >
                    Detailed View
                  </button>
                </div>
              </div>

              {viewMode === 'simple' ? (
                // Simple View - Single table for all variables with key levels
                <div className="space-y-4">
                  <div className="border border-gray-600 rounded p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-white font-medium">Key Level Values</h4>
                      <button
                        onClick={() => {
                          // Interpolate all variables at once
                          const newVariables = variables.map((variable) => {
                            // Get current key values from the local state
                            const keyValues: Record<number, number> = {};
                            keyLevels.forEach(level => {
                              keyValues[level] = variable.keyValues?.[level] !== undefined
                                ? variable.keyValues[level]
                                : calculateValueAtLevel(variable, level);
                            });

                            return interpolateValues(variable, keyValues);
                          });
                          setVariables(newVariables);
                        }}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 border border-purple-500 rounded text-white text-sm transition-all"
                      >
                        📊 Interpolate All Variables
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr>
                            <th className="text-left text-gray-300 p-2 border-b border-gray-600 min-w-[120px]">
                              Variable
                            </th>
                            {keyLevels.map(level => (
                              <th key={level} className="text-center text-gray-300 p-2 border-b border-gray-600 min-w-[80px]">
                                Lv {level}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {variables.map((variable, varIndex) => (
                            <tr key={variable.name}>
                              <td className="text-white p-2 border-b border-gray-700/50 font-medium">
                                {variable.name}
                              </td>
                              {keyLevels.map(level => (
                                <td key={level} className="p-2 border-b border-gray-700/50">
                                  <LargeNumberInput
                                    value={variable.keyValues?.[level] !== undefined
                                      ? variable.keyValues[level]
                                      : calculateValueAtLevel(variable, level)
                                    }
                                    onChange={(value) => {
                                      const newKeyValues = {
                                        ...variable.keyValues,
                                        [level]: value
                                      };
                                      updateVariable(varIndex, 'keyValues', newKeyValues);
                                    }}
                                    className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-xs text-center focus:bg-gray-600 focus:border-blue-500"
                                  />
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                // Detailed View - Single comprehensive table for all variables and levels
                <div className="space-y-4">
                  {/* Sticky Save Button */}
                  <div className="sticky top-0 bg-gray-800/95 backdrop-blur-sm p-4 -m-4 mb-0 border-b border-gray-600 z-10">
                    <button
                      onClick={handleSave}
                      className="px-6 py-2 bg-green-600 hover:bg-green-700 border border-green-500 rounded text-white font-medium transition-all"
                    >
                      💾 Save All Changes
                    </button>
                  </div>

                  {/* Comprehensive Level Table */}
                  <div className="max-h-[60vh] overflow-auto border border-gray-600 rounded">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-gray-800 z-5">
                        <tr>
                          <th className="text-left text-gray-300 p-2 border-b border-gray-600 bg-gray-800 sticky left-0 z-10 min-w-[60px]">
                            Level
                          </th>
                          {variables.map((variable) => (
                            <th key={variable.name} className="text-center text-gray-300 p-2 border-b border-gray-600 min-w-[100px]">
                              {variable.name}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {Array.from({ length: 200 }, (_, i) => i + 1).map(level => (
                          <tr key={level} className={level % 10 === 0 ? 'bg-gray-700/20' : level % 5 === 0 ? 'bg-gray-700/10' : ''}>
                            <td className="text-gray-300 p-1 border-b border-gray-700/50 bg-gray-800/50 sticky left-0 font-medium text-center">
                              {level}
                            </td>
                            {variables.map((variable, varIndex) => (
                              <td key={variable.name} className="p-1 border-b border-gray-700/50">
                                <LargeNumberInput
                                  value={variable.keyValues?.[level] || 0}
                                  onChange={(value) => {
                                    const newKeyValues = {
                                      ...variable.keyValues,
                                      [level]: value
                                    };
                                    updateVariable(varIndex, 'keyValues', newKeyValues);
                                  }}
                                  className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-xs text-center focus:bg-gray-600 focus:border-blue-500"
                                />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Preview */}
          {description && variables.length > 0 && (
            <div className="bg-gray-800/50 border border-gray-600/50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-3">Effect Preview</h3>
              <div className="space-y-2">
                {[1, 50, 100, 150, 200].map(level => {
                  let previewText = description;
                  variables.forEach(variable => {
                    const value = calculateValueAtLevel(variable, level);
                    const formattedValue = formatLargeNumber(value);
                    previewText = previewText.replace(
                      new RegExp(`\\{${variable.name}\\}`, 'g'),
                      formattedValue
                    );
                  });

                  return (
                    <div key={level} className="text-sm">
                      <span className="text-gray-400">Level {level}:</span>{' '}
                      <span className="text-white">{previewText}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};