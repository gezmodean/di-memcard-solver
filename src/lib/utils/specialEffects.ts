import type { SpecialEffect, Piece } from '../types';

function formatToSigFigs(value: number, sigFigs: number = 2): number {
  if (value === 0) return 0;
  const magnitude = Math.floor(Math.log10(Math.abs(value)));
  const factor = Math.pow(10, sigFigs - 1 - magnitude);
  return Math.round(value * factor) / factor;
}

function calculatePiecewiseValue(keyValues: Record<number, number>, level: number): number {
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
}

export function processSpecialEffectDescription(
  effect: SpecialEffect,
  pieceLevel: number,
  limitBreaks: number[] = []
): string {
  let description = effect.description;

  // Replace each variable in the template with bold formatting
  effect.variables.forEach(variable => {
    const placeholder = `{${variable.name}}`;

    // Calculate level-based value using piecewise interpolation if available
    let scaledValue: number;

    if (variable.keyValues) {
      scaledValue = calculatePiecewiseValue(variable.keyValues, pieceLevel);
    } else {
      // Calculate level-based value using linear formula
      const baseValue = variable.baseValue ?? variable.value ?? 0; // Backwards compatibility
      const valuePerLevel = variable.valuePerLevel ?? 0;
      const maxLevel = variable.maxLevel ?? 200;

      // Clamp level to maxLevel for this variable
      const effectiveLevel = Math.min(pieceLevel, maxLevel);

      // Calculate level-scaled value: baseValue + (valuePerLevel * (level - 1))
      scaledValue = baseValue + (valuePerLevel * Math.max(0, effectiveLevel - 1));
    }

    // Apply limit break multipliers if any
    // This is a placeholder - should be customizable per effect
    const limitBreakMultiplier = 1 + (limitBreaks.length * 0.2); // 20% per limit break
    scaledValue *= limitBreakMultiplier;

    // Format the value to 2 significant figures and make it bold
    const formattedValue = formatToSigFigs(scaledValue, 2).toString();
    const boldValue = `<strong style="color: #448aff;">${formattedValue}</strong>`;
    description = description.replace(new RegExp(placeholder, 'g'), boldValue);
  });

  return description;
}

export function getActiveSpecialEffects(
  piece: Piece,
  isOnField: boolean
): string[] {
  if (!piece.specialEffects) return [];

  return piece.specialEffects
    .filter(effect => {
      // If requiresOnField is false or undefined, effect is always active
      // If requiresOnField is true, piece must be on field
      return effect.requiresOnField === false || isOnField;
    })
    .map(effect => processSpecialEffectDescription(effect, piece.level, piece.limitBreaks || []));
}

export function parseSpecialEffectTemplate(template: string): {
  description: string;
  variables: string[];
} {
  const variableRegex = /\{(\w+)\}/g;
  const variables: string[] = [];
  let match;

  while ((match = variableRegex.exec(template)) !== null) {
    if (!variables.includes(match[1])) {
      variables.push(match[1]);
    }
  }

  return {
    description: template,
    variables
  };
}