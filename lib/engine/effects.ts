import type { Effect, GameState } from './types';
import { CARD_DEFS } from './cards';

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

    case 'declareGaps':
      // Transparence assumée : nommer ce qu'on ne maîtrise pas neutralise la
      // Liste Infinie du Mouton à Cinq Pattes pour le reste du combat. On ne
      // gagne pas en cochant les cases, on gagne en étant lucide.
      return {
        ...state,
        blindState: { ...state.blindState, transparent: true },
        log: [...state.log, 'Vous avez nommé ce que vous ne maîtrisez pas.'],
      };

    case 'bypassLayers':
      // Contact direct : court-circuite la chaîne d'intermédiaires.
      return {
        ...state,
        blindState: { ...state.blindState, bypassed: true },
        log: [...state.log, 'Vous avez joint la personne qui décide.'],
      };

    case 'exclusiveLock': {
      // Le coût d'Exclusivité n'est pas un malus chiffré : c'est une FERMETURE.
      // Les cartes de la catégorie visée quittent le run (main ET pioche).
      const isLocked = (defId: string): boolean =>
        (CARD_DEFS[defId]?.category ?? 'espoir') === effect.category;
      return {
        ...state,
        hand: state.hand.filter((c) => !isLocked(c.defId)),
        drawPile: state.drawPile.filter((c) => !isLocked(c.defId)),
        // La défausse aussi : sinon les cartes fermées reviendraient au remélange.
        discardPile: state.discardPile.filter((c) => !isLocked(c.defId)),
        blindState: {
          ...state.blindState,
          lockedCategories: [...state.blindState.lockedCategories, effect.category],
        },
        log: [...state.log, 'Ces cartes ne vous sont plus accessibles. Vous êtes déjà engagé.'],
      };
    }
  }
}

export function resolveEffects(state: GameState, effects: readonly Effect[]): GameState {
  return effects.reduce(resolveEffect, state);
}
