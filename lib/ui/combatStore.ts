import { create } from 'zustand';
import {
  applyAction,
  buildDeck,
  createInitialState,
  mulberry32,
  recruteur,
} from '@/lib/engine';
import type { GameState, Rng } from '@/lib/engine';

/**
 * Le store est un MIROIR de GameState + une timeline d'animation (fx).
 * Il ne décide d'aucune règle : toute transition passe par applyAction,
 * et c'est lui qui fournit les rolls — tirés du Rng seedé de la run
 * (jamais Math.random : même seed → même run, y compris depuis l'UI).
 */

export const BLIND = recruteur;

/** Les mots de la casse. Le « mais » institutionnel, au premier degré. */
const BREAK_WORDS = ['Cependant…', 'Toutefois…', 'Malheureusement…'] as const;

/** Timing de la séquence de casse : mot (750 ms) → shatter (600 ms) → état commité. */
const WORD_MS = 750;
const SHATTER_MS = 600;
const TURN_FLASH_MS = 500;

export type Fx =
  | { readonly kind: 'word'; readonly word: string }
  | { readonly kind: 'shatter' }
  | { readonly kind: 'turn'; readonly label: string }
  | null;

interface CombatStore {
  /** null tant que newRun n'a pas tourné côté client (évite tout mismatch d'hydratation). */
  readonly state: GameState | null;
  readonly fx: Fx;
  /** Pendant une séquence fx, l'état affiché est en retard sur l'état réel : on gèle les entrées. */
  readonly animating: boolean;
  newRun: (seed?: number) => void;
  playCard: (uid: string) => void;
  passTurn: () => void;
  endTurn: () => void;
}

// Le Rng vit hors du state React : c'est une séquence, pas une donnée à rendre.
let rng: Rng = mulberry32(0);
let timers: ReturnType<typeof setTimeout>[] = [];

function later(fn: () => void, ms: number): void {
  timers.push(setTimeout(fn, ms));
}

function clearTimers(): void {
  timers.forEach(clearTimeout);
  timers = [];
}

export const useCombatStore = create<CombatStore>((set, get) => {
  const resolveTurn = (type: 'PASS_TURN' | 'END_TURN'): void => {
    const { state, animating } = get();
    if (!state || animating || state.status !== 'playing') return;

    const next = applyAction(state, { type, roll: rng() }, BLIND, rng);
    if (next === state) return;

    if (next.breaksCount > state.breaksCount) {
      // Casse : le mot tombe sur l'ANCIEN chiffre, qui se brise ensuite.
      const word = BREAK_WORDS[Math.floor(rng() * BREAK_WORDS.length)] ?? BREAK_WORDS[0];
      set({ animating: true, fx: { kind: 'word', word } });
      later(() => set({ fx: { kind: 'shatter' } }), WORD_MS);
      later(() => set({ state: next, animating: false, fx: null }), WORD_MS + SHATTER_MS);
    } else {
      const label = type === 'PASS_TURN' ? 'Vous avez laissé passer' : 'Tour suivant';
      set({ animating: true, fx: { kind: 'turn', label } });
      later(() => set({ state: next, animating: false, fx: null }), TURN_FLASH_MS);
    }
  };

  return {
    state: null,
    fx: null,
    animating: false,

    newRun: (seed) => {
      clearTimers();
      rng = mulberry32(seed ?? Date.now() >>> 0);
      set({ state: createInitialState(buildDeck(rng), rng), fx: null, animating: false });
    },

    playCard: (uid) => {
      const { state, animating } = get();
      if (!state || animating) return;
      const next = applyAction(state, { type: 'PLAY_CARD', uid }, BLIND, rng);
      if (next !== state) set({ state: next });
    },

    passTurn: () => resolveTurn('PASS_TURN'),
    endTurn: () => resolveTurn('END_TURN'),
  };
});
