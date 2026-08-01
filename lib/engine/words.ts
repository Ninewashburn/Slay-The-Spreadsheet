import type { Rng } from './types';

/**
 * Le système des mots (V1) — les intents du jeu.
 *
 * Le mot pivot s'affiche SEUL, avant la phrase. Le joueur expérimenté sait déjà
 * ce qui arrive : c'est le telegraphing de Slay the Spire, sauf qu'ici il EST la
 * blague. 12 mots × N blinds = la variété sans écrire une carte de plus.
 *
 * ⚠ Contrainte de grammaire (playtest) : ces mots ne sont PAS interchangeables.
 * « Cependant » se suffit à lui-même, « Bien que » exige une subordonnée, et
 * « Malgré » un complément de nom. Un refus agrammatical se lit comme un bug,
 * pas comme une blague : la langue impeccable EST la satire (CLAUDE.md §3).
 * Chaque mot porte donc son propre gabarit, qui garantit une phrase correcte.
 */
export type WordSyntax =
  /** Se suffit à lui-même, suivi d'une virgule. */
  | 'autonome'
  /** Exige un complément (nom ou subordonnée) fourni par le gabarit. */
  | 'subordonnant'
  /** Introduit obligatoirement une complétive en « que ». */
  | 'introducteur';

export interface IntentWord {
  readonly word: string;
  /** 1 = ça peut encore tourner. 5 = c'est déjà fini, la phrase n'a plus d'importance. */
  readonly gravity: 1 | 2 | 3 | 4 | 5;
  readonly syntax: WordSyntax;
  /**
   * Rend la phrase pivot COMPLÈTE et grammaticalement correcte, à partir de la
   * clôture (« nous ne donnerons pas suite à votre candidature. »).
   */
  readonly render: (closing: string) => string;
}

export const INTENT_WORDS: readonly IntentWord[] = [
  {
    word: 'Certes',
    gravity: 1,
    syntax: 'subordonnant',
    render: (c) => `Certes, votre profil présente de réelles qualités, mais ${c}`,
  },
  {
    word: 'Bien que',
    gravity: 1,
    syntax: 'subordonnant',
    render: (c) => `Bien que votre parcours soit solide, ${c}`,
  },
  { word: 'Cependant', gravity: 2, syntax: 'autonome', render: (c) => `Cependant, ${c}` },
  { word: 'Toutefois', gravity: 2, syntax: 'autonome', render: (c) => `Toutefois, ${c}` },
  { word: 'Néanmoins', gravity: 2, syntax: 'autonome', render: (c) => `Néanmoins, ${c}` },
  {
    word: 'Malgré',
    gravity: 3,
    syntax: 'subordonnant',
    render: (c) => `Malgré la qualité de votre dossier, ${c}`,
  },
  { word: 'Hélas', gravity: 3, syntax: 'autonome', render: (c) => `Hélas, ${c}` },
  {
    word: 'Malheureusement',
    gravity: 4,
    syntax: 'autonome',
    render: (c) => `Malheureusement, ${c}`,
  },
  {
    word: 'Nonobstant',
    gravity: 4,
    syntax: 'subordonnant',
    render: (c) => `Nonobstant les éléments que vous nous avez transmis, ${c}`,
  },
  {
    word: 'Force est de constater',
    gravity: 5,
    syntax: 'introducteur',
    render: (c) => `Force est de constater que ${c}`,
  },
  {
    word: 'Nous avons le regret',
    gravity: 5,
    syntax: 'introducteur',
    render: (c) => `Nous avons le regret de vous informer que ${c}`,
  },
  {
    word: 'Après une étude attentive',
    gravity: 5,
    syntax: 'autonome',
    render: (c) => `Après une étude attentive de votre candidature, ${c}`,
  },
];

/**
 * Le mot annoncé pour un niveau de gravité donné. Le joueur apprend l'échelle en
 * la subissant : personne ne lui dit que « Nonobstant » est pire que
 * « Cependant », il le découvre.
 */
export function pickIntent(gravity: number, rng: Rng): IntentWord {
  const clamped = Math.max(1, Math.min(5, Math.round(gravity)));
  const pool = INTENT_WORDS.filter((w) => w.gravity === clamped);
  const source = pool.length > 0 ? pool : INTENT_WORDS;
  return source[Math.floor(rng() * source.length)] ?? (INTENT_WORDS[2] as IntentWord);
}

export function pickWord(gravity: number, rng: Rng): string {
  return pickIntent(gravity, rng).word;
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
