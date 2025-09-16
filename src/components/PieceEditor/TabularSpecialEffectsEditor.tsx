import React, { useState, useMemo } from 'react';
import type { SpecialEffect, SpecialEffectVariable } from '../../lib/types';
import { LargeNumberInput } from '../UI/LargeNumberInput';

interface TabularSpecialEffectsEditorProps {
  effects: SpecialEffect[];
  onChange: (effects: SpecialEffect[]) => void;
  maxLevel?: number;
}

export const TabularSpecialEffectsEditor: React.FC<TabularSpecialEffectsEditorProps> = ({
  effects,
  onChange,
  maxLevel = 200
}) => {
  const [selectedEffect, setSelectedEffect] = useState(0);
  // const [previewLevel, setPreviewLevel] = useState(1);

  // Generate level breakpoints (every 10 levels + key levels)
  const levelBreakpoints = useMemo(() => {
    const breakpoints = [1];
    for (let i = 10; i <= maxLevel; i += 10) {
      breakpoints.push(i);
    }
    // Add some key levels if not already included
    [25, 50, 75, 100, 125, 150, 175, 200].forEach(level => {
      if (level <= maxLevel && !breakpoints.includes(level)) {
        breakpoints.push(level);
      }
    });
    return breakpoints.sort((a, b) => a - b);
  }, [maxLevel]);

  const addNewEffect = () => {
    const newEffect: SpecialEffect = {
      description: "New effect: increases stat by {value}%",
      variables: [{
        name: "value",
        baseValue: 1,
        valuePerLevel: 0.1,
        maxLevel: 200
      }],
      requiresOnField: true
    };
    onChange([...effects, newEffect]);
    setSelectedEffect(effects.length);
  };

  const removeEffect = (index: number) => {
    const newEffects = effects.filter((_, i) => i !== index);
    onChange(newEffects);
    if (selectedEffect >= newEffects.length) {
      setSelectedEffect(Math.max(0, newEffects.length - 1));
    }
  };

  const updateEffect = (index: number, updates: Partial<SpecialEffect>) => {
    const newEffects = [...effects];
    newEffects[index] = { ...newEffects[index], ...updates };
    onChange(newEffects);
  };

  const updateVariable = (effectIndex: number, varIndex: number, updates: Partial<SpecialEffectVariable>) => {
    const newEffects = [...effects];
    const newVariables = [...newEffects[effectIndex].variables];
    newVariables[varIndex] = { ...newVariables[varIndex], ...updates };
    newEffects[effectIndex] = { ...newEffects[effectIndex], variables: newVariables };
    onChange(newEffects);
  };

  const addVariable = (effectIndex: number) => {
    const newVariable: SpecialEffectVariable = {
      name: "newVar",
      baseValue: 1,
      valuePerLevel: 0.1,
      maxLevel: 200
    };
    const newEffects = [...effects];
    newEffects[effectIndex] = {
      ...newEffects[effectIndex],
      variables: [...newEffects[effectIndex].variables, newVariable]
    };
    onChange(newEffects);
  };

  const removeVariable = (effectIndex: number, varIndex: number) => {
    const newEffects = [...effects];
    newEffects[effectIndex] = {
      ...newEffects[effectIndex],
      variables: newEffects[effectIndex].variables.filter((_, i) => i !== varIndex)
    };
    onChange(newEffects);
  };

  const calculateValueAtLevel = (variable: SpecialEffectVariable, level: number): number => {
    // If we have keyValues stored in the variable, use piecewise linear interpolation
    if (variable.keyValues) {
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

        // Round to 2 significant figures
        return formatToSigFigs(interpolatedValue, 2);
      }
    }

    // Fallback (shouldn't reach here)
    return keyValues[levels[0]] || 0;
  };

  const currentEffect = effects[selectedEffect];

  return (
    <div className="bg-gray-950 border border-gray-700 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">Special Effects Editor</h3>
        <button
          onClick={addNewEffect}
          className="px-3 py-1 bg-green-600 hover:bg-green-700 border border-green-500 rounded text-white text-sm transition-all"
        >
          Add Effect
        </button>
      </div>

      {effects.length === 0 ? (
        <div className="text-gray-400 text-center py-8">
          No special effects. Click "Add Effect" to create one.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Effects List */}
          <div className="space-y-4">
            <h4 className="text-md font-semibold text-white">Effects List</h4>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {effects.map((effect, index) => (
                <div
                  key={index}
                  className={`p-3 border rounded cursor-pointer transition-all ${
                    selectedEffect === index
                      ? 'border-blue-500 bg-blue-900/20'
                      : 'border-gray-600 bg-gray-800/50 hover:bg-gray-700/50'
                  }`}
                  onClick={() => setSelectedEffect(index)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white truncate">
                        Effect {index + 1}
                      </div>
                      <div className="text-xs text-gray-400 mt-1 line-clamp-2">
                        {effect.description}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {effect.variables.length} variable(s) • {effect.requiresOnField ? 'On Field' : 'Always Active'}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeEffect(index);
                      }}
                      className="ml-2 text-red-400 hover:text-red-300 text-xs"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Effect Details */}
          {currentEffect && (
            <div className="space-y-4">
              <h4 className="text-md font-semibold text-white">Effect Details</h4>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description Template:
                </label>
                <textarea
                  value={currentEffect.description}
                  onChange={(e) => updateEffect(selectedEffect, { description: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm resize-none"
                  rows={2}
                  placeholder="e.g., Increases ATK by {atkBonus}% when on field"
                />
                <div className="text-xs text-gray-400 mt-1">
                  Use {"{variableName}"} to reference variables
                </div>
              </div>

              {/* Requires On Field */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="requiresOnField"
                  checked={currentEffect.requiresOnField !== false}
                  onChange={(e) => updateEffect(selectedEffect, { requiresOnField: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="requiresOnField" className="text-sm text-gray-300">
                  Only active when piece is on field
                </label>
              </div>

              {/* Variables */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-300">Variables:</label>
                  <button
                    onClick={() => addVariable(selectedEffect)}
                    className="px-2 py-1 bg-blue-600 hover:bg-blue-700 border border-blue-500 rounded text-white text-xs transition-all"
                  >
                    Add Variable
                  </button>
                </div>

                <div className="space-y-3">
                  {currentEffect.variables.map((variable, varIndex) => (
                    <div key={varIndex} className="border border-gray-600 rounded p-3 bg-gray-800/30">
                      <div className="flex items-center justify-between mb-2">
                        <input
                          type="text"
                          value={variable.name}
                          onChange={(e) => updateVariable(selectedEffect, varIndex, { name: e.target.value })}
                          className="px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm font-mono"
                          placeholder="variableName"
                        />
                        <button
                          onClick={() => removeVariable(selectedEffect, varIndex)}
                          className="text-red-400 hover:text-red-300 text-sm"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Base Value (Level 1):</label>
                          <LargeNumberInput
                            value={variable.baseValue}
                            onChange={(value) => updateVariable(selectedEffect, varIndex, { baseValue: value })}
                            className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Per Level:</label>
                          <LargeNumberInput
                            value={variable.valuePerLevel || 0}
                            onChange={(value) => updateVariable(selectedEffect, varIndex, { valuePerLevel: value })}
                            className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-xs"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Max Level:</label>
                        <input
                          type="number"
                          value={variable.maxLevel || 200}
                          onChange={(e) => updateVariable(selectedEffect, varIndex, { maxLevel: parseInt(e.target.value) || 200 })}
                          className="w-20 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-xs"
                          min={1}
                          max={200}
                        />
                      </div>

                      {/* Preview Table */}
                      <div className="mt-3">
                        <div className="text-xs text-gray-400 mb-2">Level Preview:</div>
                        <div className="max-h-32 overflow-y-auto">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="text-gray-400">
                                <th className="text-left py-1 px-2">Level</th>
                                <th className="text-right py-1 px-2">Value</th>
                              </tr>
                            </thead>
                            <tbody className="text-gray-300">
                              {levelBreakpoints.slice(0, 8).map(level => (
                                <tr key={level} className="border-t border-gray-700">
                                  <td className="py-1 px-2">{level}</td>
                                  <td className="text-right py-1 px-2 font-mono">
                                    {formatToSigFigs(calculateValueAtLevel(variable, level), 2)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};