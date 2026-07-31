// ============================================================
// Le contrat du moteur. Trois règles non négociables (CLAUDE.md) :
// 1. Les effets sont de la DATA, jamais des méthodes codées en dur.
// 2. Un blind est une RÈGLE + un SEUIL — jamais une créature à PV.
// 3. Le hasard est INJECTÉ (roll, Rng) : le moteur est déterministe
//    et testable à 100 %. Même seed → même run (daily runs gratuits).
// ============================================================

/** Générateur pseudo-aléatoire injecté. Retourne un nombre dans [0, 1). */
export type Rng = () => number;

// --- Effets : la data que le résolveur unique (effects.ts) interprète. ---
export type Effect =
  | { readonly kind: 'multiplyHope'; readonly factor: number; readonly baseIfZero: number }
  | { readonly kind: 'addHope'; readonly amount: number }
  | { readonly kind: 'shieldNextBreak'; readonly reduction: number }
  | { readonly kind: 'reduceRiskThisTurn'; readonly factor: number }
  | { readonly kind: 'skipBlind' } // parqué (Cooptation, Acte II+) — no-op dans le slice
  // V1 — Transparence assumée : nommer ses lacunes neutralise la Liste Infinie.
  | { readonly kind: 'declareGaps' }
  // V1 — Contact direct / Réseau : court-circuite la chaîne d'intermédiaires.
  | { readonly kind: 'bypassLayers' }
  // V1 — Exclusivité : le coût est une FERMETURE, pas un malus. Retire du run
  // toutes les autres cartes de la catégorie visée (main ET pioche).
  | { readonly kind: 'exclusiveLock'; readonly category: CardCategory };

/**
 * Catégorie de carte. Sert au code couleur (CLAUDE.md §6, lisibilité UNO) et à
 * la carte Exclusivité, qui ferme une catégorie entière pour le reste du run.
 */
export type CardCategory = 'espoir' | 'utilitaire' | 'piege';

/** Définition d'une carte (le modèle). */
export interface CardDef {
  readonly id: string;
  readonly name: string;
  readonly cost: number;
  readonly effects: readonly Effect[];
  /** La phrase réelle dont la carte est la traduction littérale. Jamais une vanne ajoutée. */
  readonly flavor?: string;
  /**
   * Les mots-clés que la carte porte. Seul un blind `word-trigger` (l'ATS) les
   * lit : il bloque toute carte qui ne porte pas SON mot exact. Ailleurs, ignorés.
   */
  readonly keywords?: readonly string[];
  /** Défaut : 'espoir'. Le code couleur et la portée d'Exclusivité en dépendent. */
  readonly category?: CardCategory;
  /**
   * Les exigences que la carte couvre face au Mouton à Cinq Pattes. Vocabulaire
   * volontairement NON technique (CLAUDE.md §3) : « polyvalent », « permis B »…
   */
  readonly covers?: readonly string[];
}

/** Instance d'une carte dans le deck (les doublons ont chacun leur uid). */
export interface CardInstance {
  readonly uid: string;
  readonly defId: string;
}

// --- Blinds ---
export type BlindKind =
  | 'probabilistic' // le Recruteur du proto : risque croissant avec l'Espoir
  | 'word-trigger' // l'ATS : bloque toute carte sans le mot-clé exact (V0.5)
  | 'silent-decay' // le Ghosteur : pas de seuil à atteindre, l'Espoir se décompose (V0.5)
  | 'escalating-demands' // Mouton à Cinq Pattes : une exigence de plus chaque tour (V1)
  | 'nested-layers' // La Poupée Russe : des couches, le seuil monte, la récompense fond (V1)
  | 'number-first' // Prétentions Salariales : parler en premier coûte cher (V1)
  | 'no-resolution' // Le Poste Fictif : l'offre n'a jamais été ouverte (V1)
  | 'scripted-loss'; // Le Manager qui a Pris un Senior : tout réussi, défaite écrite (V1)

export interface Blind {
  readonly id: string;
  readonly name: string;
  readonly kind: BlindKind;
  /** L'Espoir FINAL exigé pour gagner. La moitié « score » de la thèse. 0 = pas de seuil. */
  readonly seuil: number;
  readonly maxTurns: number;
  /** Ligne de mort quand l'Espoir est brisé deux fois. */
  readonly deathLineShattered: string;
  /** Ligne de mort quand la run se termine sous le seuil. */
  readonly deathLineBelowSeuil: string;
  readonly victoryLine: string;
  /** La règle du blind, en langage d'entreprise. Affichée, jamais expliquée. */
  readonly rule: string;
  /**
   * Le mot exact exigé par l'offre (blinds `word-trigger` uniquement). Toute
   * carte qui ne le porte pas est BLOQUÉE, pas affaiblie. « Angular » ≠ « AngularJS ».
   */
  readonly requiredKeyword?: string;
  /** `escalating-demands` : le pool d'exigences tirées une par une. */
  readonly demandPool?: readonly string[];
  /** `nested-layers` : nombre de couches, et ce que chacune ajoute au seuil. */
  readonly layers?: number;
  readonly layerSeuilStep?: number;
  /** `nested-layers` : récompense affichée au départ, elle fond à chaque couche. */
  readonly rewardStart?: number;
  readonly rewardKeptPerLayer?: number;
  /** Fonction PURE : même état → même risque. Le brouillard est pour le joueur, pas pour les tests. */
  computeRisk(state: GameState): number;
  /**
   * Blinds `silent-decay` (le Ghosteur) uniquement : l'Espoir qui reste après
   * un tour de décomposition. Déterministe, sans roll — il ne « tape » pas,
   * il attend. Plus l'Espoir est haut, plus il fond vite (The Sorrow).
   */
  computeDecay?(state: GameState): number;
}

// --- L'offre : le niveau lui-même (V1) ---
/** Un « avantage » d'offre est en réalité un modificateur de règles (Balatro). */
export type OfferModifier =
  | { readonly kind: 'seuilFactor'; readonly factor: number }
  | { readonly kind: 'turnsDelta'; readonly delta: number }
  | { readonly kind: 'lockLeave' } // « On est une famille » : on ne quitte pas sa famille
  | { readonly kind: 'energyDelta'; readonly delta: number };

export interface Offer {
  readonly id: string;
  readonly title: string;
  readonly contract: string;
  /** Les lignes creuses de l'annonce, dont le vide légal. */
  readonly advantages: readonly string[];
  /** Le red flag, lisible entre les lignes. C'est LUI qui porte le modificateur. */
  readonly redFlag: { readonly label: string; readonly modifier: OfferModifier };
  /** Le blind que cette offre convoque. */
  readonly blindId: string;
  /** Fourchette affichée. Au centime près : la fausse précision EST la blague. */
  readonly salaryLow: number;
  readonly salaryHigh: number;
}

// --- État ---
export type RunStatus = 'playing' | 'won' | 'lost' | 'passive';
export type LostReason = 'shattered' | 'belowSeuil' | 'demandUnmet' | 'scripted';

/**
 * L'état propre au blind courant. Tout vit dans GameState (CLAUDE.md §5 :
 * aucun flag d'état baladeur), y compris ce que seuls certains kinds lisent.
 */
export interface BlindState {
  /** `escalating-demands` : les exigences révélées, dans l'ordre. */
  readonly demands: readonly string[];
  /** `escalating-demands` : le joueur a nommé ses lacunes. Neutralise la Liste Infinie. */
  readonly transparent: boolean;
  /** `nested-layers` : couche courante (0 = la première). */
  readonly layer: number;
  /** `nested-layers` : la récompense affichée, qui fond couche après couche. */
  readonly reward: number;
  /** `nested-layers` : la chaîne a été court-circuitée (carte Contact direct). */
  readonly bypassed: boolean;
  /** `number-first` : combien de fois le joueur a annoncé un chiffre. */
  readonly numbersAnnounced: number;
  /** Le mot pivot annoncé pour ce tour (intent visible). null = rien annoncé. */
  readonly intent: string | null;
  /** Catégories fermées par Exclusivité pour le reste du run. */
  readonly lockedCategories: readonly CardCategory[];
  /** L'offre interdit de partir (« On est une famille »). */
  readonly leaveLocked: boolean;
}

export interface GameState {
  readonly hope: number;
  /** Espoir cumulé généré sur la run — distingue l'engagement réel de la simple survie. */
  readonly hopeGeneratedTotal: number;
  readonly energy: number;
  readonly energyMax: number;
  readonly turn: number;
  readonly drawPile: readonly CardInstance[];
  readonly discardPile: readonly CardInstance[];
  readonly hand: readonly CardInstance[];
  /** Passer est interdit après avoir joué une carte ce tour (sinon « jouer puis passer » domine). */
  readonly playedThisTurn: boolean;
  /** Compte les cartes jouées sur tout le blind (voie de victoire « par le silence »). */
  readonly cardsPlayedTotal: number;
  /** null = pas de bouclier. Sinon : facteur de casse à utiliser à la place de 0.1. */
  readonly shield: number | null;
  /** Remis à 1 à CHAQUE nouveau tour, quel que soit le chemin (bug v2 corrigé par construction). */
  readonly riskModifier: number;
  readonly breaksCount: number;
  readonly status: RunStatus;
  readonly lostReason: LostReason | null;
  readonly lastBreakFrom: number | null;
  readonly blindState: BlindState;
  readonly log: readonly string[];
}

// --- Méta-progression (persistée par l'UI, jamais par le moteur) ---
export interface MetaState {
  readonly runsPlayed: number;
  /** Reliques débloquées. « Expérience du candidat » arrive après la run 1. */
  readonly relics: readonly string[];
  readonly achievements: readonly string[];
}

// --- Actions : le roll est fourni par l'appelant (UI ou test), jamais tiré dans le moteur. ---
export type Action =
  | { readonly type: 'PLAY_CARD'; readonly uid: string }
  | { readonly type: 'PASS_TURN'; readonly roll: number }
  | { readonly type: 'END_TURN'; readonly roll: number }
  // Partir : la seule victoire contre le Ghosteur. On garde l'Espoir qu'on a.
  | { readonly type: 'LEAVE' };
