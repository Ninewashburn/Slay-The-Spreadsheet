import type { Effect, GameState } from './types';

/**
 * Résout UN effet sur un état donné et retourne un NOUVEL état.
 * Jamais de mutation. Cartes et gimmicks de blinds passent tous par ici :
 * c'est ce qui rend chaque règle testable en isolation, sans React ni UI.
 */
export function resolveEffect(state: GameState, effect: Effect): GameState {
  switch (effect.kind) {
    case 'multiplyHope': {
      const hope = state.hope === 0 ? effect.baseIfZero : state.hope * effect.factor;
      const delta = Math.max(0, hope - state.hope);
      return { ...state, hope, hopeGeneratedTotal: state.hopeGeneratedTotal + delta };
    }

    case 'addHope':
      return {
        ...state,
        hope: state.hope + effect.amount,
        hopeGeneratedTotal: state.hopeGeneratedTotal + Math.max(0, effect.amount),
      };

    case 'shieldNextBreak':
      return { ...state, shield: effect.reduction };

    case 'reduceRiskThisTurn':
      return { ...state, riskModifier: state.riskModifier * effect.factor };

    case 'skipBlind':
      // Acte II+ (Cooptation : saute l'ATS, jamais la fin du process).
      // Le type existe déjà ; l'effet reste un no-op tant qu'il n'y a
      // qu'un seul blind dans le run.
      return state;
  }
}

export function resolveEffects(state: GameState, effects: readonly Effect[]): GameState {
  return effects.reduce(resolveEffect, state);
}
