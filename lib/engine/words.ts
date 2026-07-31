import type { Rng } from './types';

/**
 * Le système des mots (V1) — les intents du jeu.
 *
 * Le mot pivot s'affiche SEUL, avant la phrase. Le joueur expérimenté sait déjà
 * ce qui arrive : c'est le telegraphing de Slay the Spire, sauf qu'ici il EST la
 * blague. 12 mots × N blinds = la variété sans écrire une carte de plus.
 *
 * L'échelle va du négociable au fatal. Ces mots sont le cœur mécanique du jeu :
 * l'interdiction des tics d'IA (CLAUDE.md §8) ne les vise PAS.
 */
export interface IntentWord {
  readonly word: string;
  /** 1 = ça peut encore tourner. 5 = c'est déjà fini, la phrase n'a plus d'importance. */
  readonly gravity: 1 | 2 | 3 | 4 | 5;
}

export const INTENT_WORDS: readonly IntentWord[] = [
  { word: 'Certes', gravity: 1 },
  { word: 'Bien que', gravity: 1 },
  { word: 'Cependant', gravity: 2 },
  { word: 'Toutefois', gravity: 2 },
  { word: 'Néanmoins', gravity: 2 },
  { word: 'Malgré', gravity: 3 },
  { word: 'Hélas', gravity: 3 },
  { word: 'Malheureusement', gravity: 4 },
  { word: 'Nonobstant', gravity: 4 },
  { word: 'Force est de constater', gravity: 5 },
  { word: 'Nous avons le regret', gravity: 5 },
  { word: 'Après une étude attentive', gravity: 5 },
];

/**
 * Le mot annoncé pour un niveau de gravité donné. Le joueur apprend l'échelle
 * en la subissant : personne ne lui dit que « Nonobstant » est pire que
 * « Cependant », il le découvre.
 */
export function pickWord(gravity: number, rng: Rng): string {
  const clamped = Math.max(1, Math.min(5, Math.round(gravity)));
  const pool = INTENT_WORDS.filter((w) => w.gravity === clamped);
  const source = pool.length > 0 ? pool : INTENT_WORDS;
  return source[Math.floor(rng() * source.length)]?.word ?? 'Cependant';
}

/**
 * La gravité que mérite un état : plus l'Espoir est haut face au seuil, plus le
 * « mais » qui vient sera lourd. Le joueur ne voit jamais ce calcul, seulement
 * le mot (règle d'information, CLAUDE.md §4).
 */
export function gravityFor(hope: number, seuil: number): number {
  if (seuil <= 0) return hope > 40 ? 4 : 2;
  const ratio = hope / seuil;
  if (ratio < 0.4) return 1;
  if (ratio < 0.8) return 2;
  if (ratio < 1.2) return 3;
  if (ratio < 2) return 4;
  return 5;
}
