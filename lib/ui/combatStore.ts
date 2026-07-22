import { create } from 'zustand';
import { applyAction, buildDeck, createInitialState, mulberry32, SLICE_RUN } from '@/lib/engine';
import type { Blind, GameState, Rng } from '@/lib/engine';

/**
 * Le store est un MIROIR de GameState + l'orchestration de la RUN (l'enchaînement
 * des blinds) + une timeline d'animation (fx). Il ne décide d'aucune RÈGLE :
 * toute transition d'état passe par applyAction, et c'est lui qui fournit les
 * rolls — tirés du Rng seedé de la run (jamais Math.random). L'Espoir gagné à un
 * blind est reporté sur le suivant.
 */

export { SLICE_RUN };

/** Les mots de la casse. Le « mais » institutionnel, au premier degré. */
const BREAK_WORDS = ['Cependant…', 'Toutefois…', 'Malheureusement…'] as const;

const WORD_MS = 750;
const SHATTER_MS = 600;
const TURN_FLASH_MS = 500;

export type Phase = 'home' | 'combat';

export type Fx =
  | { readonly kind: 'word'; readonly word: string }
  | { readonly kind: 'shatter' }
  | { readonly kind: 'turn'; readonly label: string }
  | null;

interface CombatStore {
  readonly phase: Phase;
  /** Index du blind courant dans SLICE_RUN. */
  readonly blindIndex: number;
  /** null tant que la run n'a pas démarré côté client (évite tout mismatch d'hydratation). */
  readonly state: GameState | null;
  readonly fx: Fx;
  readonly animating: boolean;
  /** Le blind courant, lu par l'UI (jamais pour décider une règle). */
  blind: () => Blind;
  /** true si le blind courant est le dernier de la run. */
  isLastBlind: () => boolean;
  startRun: (seed?: number) => void;
  continueToNextBlind: () => void;
  toHome: () => void;
  playCard: (uid: string) => void;
  passTurn: () => void;
  endTurn: () => void;
  leave: () => void;
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
  const activeBlind = (): Blind => SLICE_RUN[get().blindIndex] ?? SLICE_RUN[0]!;

  const resolveTurn = (type: 'PASS_TURN' | 'END_TURN'): void => {
    const { state, animating } = get();
    if (!state || animating || state.status !== 'playing') return;
    const blind = activeBlind();

    const next = applyAction(state, { type, roll: rng() }, blind, rng);
    if (next === state) return;

    if (next.breaksCount > state.breaksCount) {
      // Casse (Recruteur) : le mot tombe sur l'ANCIEN chiffre, qui se brise.
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
    phase: 'home',
    blindIndex: 0,
    state: null,
    fx: null,
    animating: false,

    blind: activeBlind,
    isLastBlind: () => get().blindIndex >= SLICE_RUN.length - 1,

    startRun: (seed) => {
      clearTimers();
      rng = mulberry32(seed ?? Date.now() >>> 0);
      set({
        phase: 'combat',
        blindIndex: 0,
        state: createInitialState(buildDeck(rng), rng),
        fx: null,
        animating: false,
      });
    },

    continueToNextBlind: () => {
      const { state, blindIndex } = get();
      if (!state || blindIndex >= SLICE_RUN.length - 1) return;
      clearTimers();
      set({
        blindIndex: blindIndex + 1,
        // L'Espoir gagné est reporté : on arrive plein d'espoir, et il fond.
        state: createInitialState(buildDeck(rng), rng, { startingHope: state.hope }),
        fx: null,
        animating: false,
      });
    },

    toHome: () => {
      clearTimers();
      set({ phase: 'home', fx: null, animating: false });
    },

    playCard: (uid) => {
      const { state, animating } = get();
      if (!state || animating) return;
      const next = applyAction(state, { type: 'PLAY_CARD', uid }, activeBlind(), rng);
      if (next !== state) set({ state: next });
    },

    passTurn: () => resolveTurn('PASS_TURN'),
    endTurn: () => resolveTurn('END_TURN'),

    leave: () => {
      const { state, animating } = get();
      if (!state || animating || state.status !== 'playing') return;
      const next = applyAction(state, { type: 'LEAVE' }, activeBlind(), rng);
      if (next !== state) set({ state: next });
    },
  };
});
