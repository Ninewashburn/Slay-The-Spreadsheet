import { resolveEffects } from '@/lib/engine';
import type { CardDef, GameState } from '@/lib/engine';

/**
 * Règle d'information (CLAUDE.md §4) : tout ce que le joueur contrôle est
 * calculé et affiché. L'aperçu rejoue les effets de la carte via le VRAI
 * résolveur du moteur — jamais une seconde implémentation qui divergerait.
 */
export interface CardPreview {
  readonly text: string;
  /** 'hope' = gain d'Espoir (bleu) ; 'neutral' = utilitaire (vert doux). */
  readonly tone: 'hope' | 'neutral';
  /** true = jouer cette carte franchit le seuil : la carte te montre la sortie. */
  readonly goal: boolean;
}

const NEUTRAL_LABELS: Partial<Record<CardDef['effects'][number]['kind'], string>> = {
  shieldNextBreak: 'réduit la prochaine casse',
  reduceRiskThisTurn: '− risque ce tour',
};

export function previewCard(state: GameState, def: CardDef, seuil: number): CardPreview {
  const after = resolveEffects(state, def.effects);

  if (after.hope !== state.hope) {
    const goal = after.hope >= seuil;
    return {
      text: `${Math.round(state.hope)} → ${Math.round(after.hope)}${goal ? ' ✓' : ''}`,
      tone: 'hope',
      goal,
    };
  }

  // Fallback vide : une carte sans gain d'Espoir ni libellé connu n'affiche
  // pas de pastille (jamais un tiret décoratif à l'écran — voix du texte, CLAUDE.md §8).
  const kind = def.effects[0]?.kind;
  return {
    text: (kind && NEUTRAL_LABELS[kind]) ?? '',
    tone: 'neutral',
    goal: false,
  };
}

/**
 * Le brouillard (CLAUDE.md §4) : le risque n'affiche JAMAIS un pourcentage.
 * Tu connais ton dossier ; tu ne connais jamais tes chances.
 */
export function riskLine(
  state: GameState,
  computeRisk: (s: GameState) => number,
): { readonly text: string; readonly risky: boolean } {
  if (state.lastBreakFrom !== null) {
    return { text: `Vous étiez à ${state.lastBreakFrom}.`, risky: false };
  }
  if (state.hope <= 0) {
    return { text: "Rien à perdre pour l'instant.", risky: false };
  }
  const p = computeRisk(state) * state.riskModifier;
  if (p < 0.15) return { text: 'Ça reste raisonnable.', risky: false };
  if (p < 0.4) return { text: 'Vous sentez un léger doute.', risky: false };
  if (p < 0.65) return { text: 'Quelque chose pourrait mal tourner.', risky: true };
  return { text: 'Vous y croyez peut-être un peu trop.', risky: true };
}
