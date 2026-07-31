import type { Blind, GameState, MetaState } from './types';

/**
 * La méta-progression (V1). Décision de principe : **le déblocage, c'est la
 * connaissance** (GAME_DESIGN §10). Le jeu ne fait jamais la leçon. Il te fait
 * vivre la même chose deux fois, et la deuxième tu sais.
 *
 * Le moteur reste pur : il calcule ce qui est débloqué, il ne persiste rien.
 * C'est l'UI qui stocke le MetaState entre les runs.
 */

export const RELIC_EXPERIENCE = 'experience-candidat';

export const EMPTY_META: MetaState = { runsPlayed: 0, relics: [], achievements: [] };

/**
 * Relique « Expérience du candidat » — le système de durée de vie du jeu.
 * Run 1 : le mail de refus est imblocable, lettre par lettre, une seule fois.
 * Ensuite : la relique le saute à jamais. Le jeu te fait perdre du temps, puis
 * te rend ton temps. La run 20 est plus rapide que la run 1.
 */
export function mustReadFullRefusal(meta: MetaState): boolean {
  return !meta.relics.includes(RELIC_EXPERIENCE);
}

/** La relique s'acquiert en ayant lu le mail en entier, une fois. */
export function grantRelicsAfterRun(meta: MetaState): MetaState {
  if (meta.relics.includes(RELIC_EXPERIENCE)) return meta;
  return { ...meta, relics: [...meta.relics, RELIC_EXPERIENCE] };
}

export interface AchievementDef {
  readonly id: string;
  readonly name: string;
  /** Révélée seulement une fois obtenue. Les succès sont cachés (GAME_DESIGN §10). */
  readonly description: string;
}

export const ACHIEVEMENTS: readonly AchievementDef[] = [
  {
    id: 'je-savais',
    name: 'Je savais',
    description: 'Vous avez fermé un refus avant d’avoir lu le mot qui l’annonçait.',
  },
  {
    id: 'lu-en-diagonale',
    name: 'Lu en diagonale',
    description: 'Un logiciel a lu votre dossier et l’a jugé conforme.',
  },
  {
    id: 'culture-fit',
    name: 'Culture Fit',
    description: 'Tout s’est bien passé. Vous avez perdu quand même.',
  },
  {
    id: 'premier-ghosting',
    name: 'Premier ghosting',
    description: 'Vous avez attendu une réponse qui n’existait pas.',
  },
  {
    id: 'parti-a-temps',
    name: 'Parti à temps',
    description: 'Vous êtes parti en gardant votre Espoir intact.',
  },
  {
    id: 'candidat-parfait',
    name: 'Le candidat parfait n’existe pas',
    description: 'Vous avez encaissé cinq exigences sur une seule annonce.',
  },
  {
    id: 'jamais-parle-en-premier',
    name: 'Jamais en premier',
    description: 'Vous avez négocié sans annoncer plus d’un chiffre.',
  },
  {
    id: 'deja-engage',
    name: 'Déjà engagé',
    description: 'Vous avez signé une exclusivité sans savoir ce qu’elle fermait.',
  },
];

export interface AchievementContext {
  /** Le joueur a fermé le mail de refus avant l'apparition du mot pivot. */
  readonly dismissedRefusalEarly?: boolean;
}

/**
 * Les succès obtenus au terme d'un blind. Fonction PURE : même état, mêmes
 * succès. Renvoie uniquement les NOUVEAUX (jamais de doublon).
 */
export function evaluateAchievements(
  state: GameState,
  blind: Blind,
  meta: MetaState,
  ctx: AchievementContext = {},
): readonly string[] {
  const won = state.status === 'won';
  const lost = state.status === 'lost';
  const unlocked: string[] = [];

  if (ctx.dismissedRefusalEarly === true) unlocked.push('je-savais');
  if (won && blind.kind === 'word-trigger') unlocked.push('lu-en-diagonale');
  if (lost && state.lostReason === 'scripted') unlocked.push('culture-fit');
  if (lost && blind.kind === 'silent-decay') unlocked.push('premier-ghosting');
  if (won && blind.kind === 'silent-decay' && state.hope >= 30) unlocked.push('parti-a-temps');
  if (state.blindState.demands.length >= 5) unlocked.push('candidat-parfait');
  if (won && blind.kind === 'number-first' && state.blindState.numbersAnnounced <= 1) {
    unlocked.push('jamais-parle-en-premier');
  }
  if (state.blindState.lockedCategories.length > 0) unlocked.push('deja-engage');

  return unlocked.filter((id) => !meta.achievements.includes(id));
}

export function withAchievements(meta: MetaState, ids: readonly string[]): MetaState {
  const merged = [...meta.achievements];
  for (const id of ids) if (!merged.includes(id)) merged.push(id);
  return { ...meta, achievements: merged };
}

export function achievementById(id: string): AchievementDef | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id);
}
