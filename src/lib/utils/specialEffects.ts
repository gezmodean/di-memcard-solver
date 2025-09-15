import type { SpecialEffect, Piece } from '../types';

export function processSpecialEffectDescription(
  effect: SpecialEffect,
  _pieceLevel: number,
  limitBreaks: number[] = []
): string {
  let description = effect.description;

  // Replace each variable in the template with bold formatting
  effect.variables.forEach(variable => {
    const placeholder = `{${variable.name}}`;

    // Use the base value from the variable, potentially scaled by limit breaks
    let scaledValue = variable.value;

    // Apply limit break multipliers if any
    // This is a placeholder - should be customizable per effect
    const limitBreakMultiplier = 1 + (limitBreaks.length * 0.2); // 20% per limit break
    scaledValue *= limitBreakMultiplier;

    // Format the value appropriately and make it bold
    const formattedValue = scaledValue % 1 === 0 ? scaledValue.toString() : scaledValue.toFixed(1);
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