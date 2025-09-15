import type { SpecialEffect, Piece } from '../types';

export function processSpecialEffectDescription(
  effect: SpecialEffect,
  pieceLevel: number
): string {
  let description = effect.description;

  // Replace each variable in the template
  effect.variables.forEach(variable => {
    const placeholder = `{${variable.name}}`;
    // Scale the value based on piece level (could be more sophisticated)
    const scaledValue = (variable.value * pieceLevel / 100).toFixed(1);
    description = description.replace(new RegExp(placeholder, 'g'), scaledValue);
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
    .map(effect => processSpecialEffectDescription(effect, piece.level));
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