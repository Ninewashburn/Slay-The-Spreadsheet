import { create } from 'zustand';
import {
  ACTE_I_POOLS,
  applyAction,
  applyOffer,
  BLINDS_BY_ID,
  buildActeIDeck,
  createInitialState,
  EMPTY_META,
  evaluateAchievements,
  generateJobBoard,
  generateRefusal,
  gravityFor,
  grantRelicsAfterRun,
  mulberry32,
  mustReadFullRefusal,
  withAchievements,
} from '@/lib/engine';
import type { Blind, GameState, MetaState, Offer, Refusal, Rng } from '@/lib/engine';

/**
 * Le store : un MIROIR de GameState + l'orchestration de la RUN (job board,
 * enchaînement des étapes, méta-progression) + une timeline d'animation (fx).
 * Il ne décide d'aucune RÈGLE : toute transition passe par applyAction, et les
 * rolls viennent du Rng seedé de la run (jamais Math.random).
 */

const WORD_MS = 750;
const SHATTER_MS = 600;
const TURN_FLASH_MS = 500;
const META_KEY = 'sts.meta.v1';

export type Phase = 'home' | 'board' | 'combat' | 'refusal';

export type Fx =
  | { readonly kind: 'word'; readonly word: string }
  | { readonly kind: 'shatter' }
  | { readonly kind: 'turn'; readonly label: string }
  | null;

interface CombatStore {
  readonly phase: Phase;
  /** Étape courante de l'Acte I (0 à 4). */
  readonly step: number;
  readonly offers: readonly Offer[];
  readonly offer: Offer | null;
  readonly blind: Blind | null;
  readonly state: GameState | null;
  readonly fx: Fx;
  readonly animating: boolean;
  readonly meta: MetaState;
  /** Le refus à lire (défaite). Run 1 : imblocable. Ensuite, la relique le saute. */
  readonly refusal: Refusal | null;
  readonly refusalSkippable: boolean;
  /** Succès tout juste débloqués, à afficher. */
  readonly newAchievements: readonly string[];
  readonly isLastStep: boolean;

  loadMeta: () => void;
  startRun: (seed?: number) => void;
  pickOffer: (offer: Offer) => void;
  continueRun: () => void;
  closeRefusal: (early: boolean) => void;
  toHome: () => void;
  dismissAchievements: () => void;
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

function saveMeta(meta: MetaState): void {
  try {
    window.localStorage.setItem(META_KEY, JSON.stringify(meta));
  } catch {
    // Stockage indisponible (navigation privée) : la run reste jouable.
  }
}

export const useCombatStore = create<CombatStore>((set, get) => {
  /** Ouvre le job board de l'étape demandée. L'offre EST le niveau. */
  const openBoard = (step: number): void => {
    const pool = ACTE_I_POOLS[step] ?? ACTE_I_POOLS[0]!;
    set({
      phase: 'board',
      step,
      offers: generateJobBoard(rng, pool),
      offer: null,
      blind: null,
      fx: null,
      animating: false,
      isLastStep: step >= ACTE_I_POOLS.length - 1,
    });
  };

  /** Fin de combat : succès, puis refus à lire (défaite) ou étape suivante. */
  const settle = (next: GameState, blind: Blind): void => {
    const { meta } = get();
    const unlocked = evaluateAchievements(next, blind, meta);
    const meta2 = withAchievements(meta, unlocked);
    set({ meta: meta2, newAchievements: unlocked });
    saveMeta(meta2);

    // Le Ghosteur perdu ne parle pas : aucun refus, aucun écran. Le silence.
    const silent = blind.kind === 'silent-decay' && next.status === 'lost';
    if (next.status === 'lost' && !silent) {
      set({
        refusal: generateRefusal(rng, gravityFor(next.hope, Math.max(1, blind.seuil))),
        refusalSkippable: !mustReadFullRefusal(meta2),
      });
    }
  };

  const resolveTurn = (type: 'PASS_TURN' | 'END_TURN'): void => {
    const { state, animating, blind } = get();
    if (!state || !blind || animating || state.status !== 'playing') return;

    const next = applyAction(state, { type, roll: rng() }, blind, rng);
    if (next === state) return;

    const commit = (): void => {
      set({ state: next, animating: false, fx: null });
      if (next.status !== 'playing') settle(next, blind);
    };

    if (next.breaksCount > state.breaksCount) {
      // Le mot pivot tombe sur l'ANCIEN chiffre, qui se brise ensuite. Le mot
      // vient du MOTEUR (blindState.intent) : même seed, même mot.
      const word = next.blindState.intent ?? 'Cependant';
      set({ animating: true, fx: { kind: 'word', word: `${word}…` } });
      later(() => set({ fx: { kind: 'shatter' } }), WORD_MS);
      later(commit, WORD_MS + SHATTER_MS);
    } else {
      const label = type === 'PASS_TURN' ? 'Vous avez laissé passer' : 'Tour suivant';
      set({ animating: true, fx: { kind: 'turn', label } });
      later(commit, TURN_FLASH_MS);
    }
  };

  return {
    phase: 'home',
    step: 0,
    offers: [],
    offer: null,
    blind: null,
    state: null,
    fx: null,
    animating: false,
    meta: EMPTY_META,
    refusal: null,
    refusalSkippable: false,
    newAchievements: [],
    isLastStep: false,

    loadMeta: () => {
      try {
        const raw = window.localStorage.getItem(META_KEY);
        if (raw) set({ meta: { ...EMPTY_META, ...(JSON.parse(raw) as MetaState) } });
      } catch {
        // Donnée illisible : on repart d'une méta vierge, sans casser la run.
      }
    },

    startRun: (seed) => {
      clearTimers();
      rng = mulberry32(seed ?? Date.now() >>> 0);
      set({ state: null, refusal: null, newAchievements: [] });
      openBoard(0);
    },

    pickOffer: (offer) => {
      const base = BLINDS_BY_ID[offer.blindId];
      if (!base) return;
      const blind = applyOffer(base, offer);
      const carried = get().state?.hope ?? 0;
      set({
        phase: 'combat',
        offer,
        blind,
        state: createInitialState(buildActeIDeck(rng), rng, {
          startingHope: carried,
          blind,
          offer,
        }),
        fx: null,
        animating: false,
      });
    },

    continueRun: () => {
      const { step, isLastStep } = get();
      clearTimers();
      if (isLastStep) {
        // Fin de l'Acte I : la run est finie, la méta a progressé.
        const meta = { ...get().meta, runsPlayed: get().meta.runsPlayed + 1 };
        set({ meta, phase: 'home', state: null });
        saveMeta(meta);
        return;
      }
      openBoard(step + 1);
    },

    closeRefusal: (early) => {
      const { meta, refusal } = get();
      // « Je savais » : avoir reconnu le refus avant même de lire le mot.
      let meta2 = early ? withAchievements(meta, ['je-savais']) : meta;
      // Le mail intégral n'est imblocable qu'UNE fois : la relique s'acquiert
      // en l'ayant subi. Le jeu te fait perdre du temps, puis te rend ton temps.
      if (refusal) meta2 = grantRelicsAfterRun(meta2);
      meta2 = { ...meta2, runsPlayed: meta2.runsPlayed + 1 };
      set({
        meta: meta2,
        refusal: null,
        newAchievements: early && !meta.achievements.includes('je-savais') ? ['je-savais'] : [],
        phase: 'home',
        state: null,
      });
      saveMeta(meta2);
    },

    toHome: () => {
      clearTimers();
      set({ phase: 'home', state: null, refusal: null, fx: null, animating: false });
    },

    dismissAchievements: () => set({ newAchievements: [] }),

    playCard: (uid) => {
      const { state, animating, blind } = get();
      if (!state || !blind || animating) return;
      const next = applyAction(state, { type: 'PLAY_CARD', uid }, blind, rng);
      if (next !== state) set({ state: next });
    },

    passTurn: () => resolveTurn('PASS_TURN'),
    endTurn: () => resolveTurn('END_TURN'),

    leave: () => {
      const { state, animating, blind } = get();
      if (!state || !blind || animating || state.status !== 'playing') return;
      const next = applyAction(state, { type: 'LEAVE' }, blind, rng);
      if (next !== state) {
        set({ state: next });
        settle(next, blind);
      }
    },
  };
});
