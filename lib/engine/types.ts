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
  | { readonly kind: 'skipBlind' }; // parqué (Cooptation, Acte II+) — no-op dans le slice

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
  | 'silent-decay'; // le Ghosteur : pas de seuil à atteindre, l'Espoir se décompose (V0.5)

export interface Blind {
  readonly id: string;
  readonly name: string;
  readonly kind: BlindKind;
  /** L'Espoir FINAL exigé pour gagner. La moitié « score » de la thèse. 0 pour le Ghosteur (pas de seuil). */
  readonly seuil: number;
  readonly maxTurns: number;
  /** Ligne de mort quand l'Espoir est brisé deux fois. */
  readonly deathLineShattered: string;
  /** Ligne de mort quand la run se termine sous le seuil. */
  readonly deathLineBelowSeuil: string;
  readonly victoryLine: string;
  /**
   * Le mot exact exigé par l'offre (blinds `word-trigger` uniquement). Toute
   * carte qui ne le porte pas est BLOQUÉE, pas affaiblie. « Angular » ≠ « AngularJS ».
   */
  readonly requiredKeyword?: string;
  /** Fonction PURE : même état → même risque. Le brouillard est pour le joueur, pas pour les tests. */
  computeRisk(state: GameState): number;
  /**
   * Blinds `silent-decay` (le Ghosteur) uniquement : l'Espoir qui reste après
   * une tour de décomposition. Déterministe, sans roll — il ne « tape » pas,
   * il attend. Plus l'Espoir est haut, plus il fond vite (The Sorrow).
   */
  computeDecay?(state: GameState): number;
}

// --- État ---
export type RunStatus = 'playing' | 'won' | 'lost' | 'passive';
export type LostReason = 'shattered' | 'belowSeuil';

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
  /** null = pas de bouclier. Sinon : facteur de casse à utiliser à la place de 0.1. */
  readonly shield: number | null;
  /** Remis à 1 à CHAQUE nouveau tour, quel que soit le chemin (bug v2 corrigé par construction). */
  readonly riskModifier: number;
  readonly breaksCount: number;
  readonly status: RunStatus;
  readonly lostReason: LostReason | null;
  readonly lastBreakFrom: number | null;
  readonly log: readonly string[];
}

// --- Actions : le roll est fourni par l'appelant (UI ou test), jamais tiré dans le moteur. ---
export type Action =
  | { readonly type: 'PLAY_CARD'; readonly uid: string }
  | { readonly type: 'PASS_TURN'; readonly roll: number }
  | { readonly type: 'END_TURN'; readonly roll: number }
  // Partir : la seule victoire contre le Ghosteur. On garde l'Espoir qu'on a.
  | { readonly type: 'LEAVE' };
