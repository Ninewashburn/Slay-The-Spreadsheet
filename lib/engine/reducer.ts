import type { Action, Blind, CardDef, CardInstance, GameState, Rng, RunStatus } from './types';
import { CARD_DEFS } from './cards';
import { resolveEffects } from './effects';
import { shuffle } from './rng';

/**
 * Une carte est BLOQUÉE si le blind est un ATS (`word-trigger`) et que la carte
 * ne porte pas son mot exact. Bloquée = injouable, pas affaiblie (ROADMAP V0.5).
 * Fonction pure, partagée par le reducer (garde-fou) et l'UI (grisage).
 */
export function isBlocked(def: CardDef, blind: Blind): boolean {
  if (blind.kind !== 'word-trigger' || blind.requiredKeyword === undefined) return false;
  return !(def.keywords ?? []).includes(blind.requiredKeyword);
}

/** Jouable = assez d'Énergie ET non bloquée par l'ATS. */
export function canPlay(state: GameState, def: CardDef, blind: Blind): boolean {
  return def.cost <= state.energy && !isBlocked(def, blind);
}

// --- Constantes de règles (calibrage v5, validé en playtest) ---
export const HAND_SIZE = 3;
export const ENERGY_MAX = 3;
/** Sous ce cumul généré, la run est classée 'passive', jamais 'won'. */
export const HOPE_ENGAGEMENT_THRESHOLD = 20;
/** Casse par défaut : l'Espoir tombe à 10 % de sa valeur. */
export const BREAK_REDUCTION_DEFAULT = 0.1;
export const BREAKS_TO_LOSE = 2;
/** Passer réduit le risque de CE tour uniquement. */
export const PASS_RISK_FACTOR = 0.4;

/**
 * @param opts.startingHope Espoir de départ, reporté d'un blind à l'autre dans
 * une run (on arrive chez le Ghosteur avec l'Espoir gagné à l'ATS). Compté aussi
 * dans le cumul généré : arriver avec de l'Espoir n'est pas de la passivité.
 */
export function createInitialState(
  deck: readonly CardInstance[],
  rng: Rng,
  opts?: { readonly startingHope?: number },
): GameState {
  const startingHope = opts?.startingHope ?? 0;
  const base: GameState = {
    hope: startingHope,
    hopeGeneratedTotal: startingHope,
    energy: ENERGY_MAX,
    energyMax: ENERGY_MAX,
    turn: 1,
    drawPile: deck,
    discardPile: [],
    hand: [],
    playedThisTurn: false,
    shield: null,
    riskModifier: 1,
    breaksCount: 0,
    status: 'playing',
    lostReason: null,
    lastBreakFrom: null,
    log: [],
  };
  return draw(base, HAND_SIZE, rng);
}

/**
 * LE point de décision unique. Toute transition d'état passe par ici.
 * C'est cette centralisation qui a corrigé, par construction, les trois
 * bugs du proto (état baladeur mis à jour à plusieurs endroits).
 */
export function applyAction(state: GameState, action: Action, blind: Blind, rng: Rng): GameState {
  if (state.status !== 'playing') return state;

  switch (action.type) {
    case 'PLAY_CARD':
      return playCard(state, action.uid, blind);

    case 'PASS_TURN':
      // Passer = ne pas se manifester ce tour. Interdit si une carte a été
      // jouée (sinon « jouer puis passer » dominerait strictement).
      if (state.playedThisTurn) return state;
      return resolveTurnEnd(
        { ...state, riskModifier: state.riskModifier * PASS_RISK_FACTOR },
        blind,
        action.roll,
        rng,
      );

    case 'END_TURN':
      return resolveTurnEnd(state, blind, action.roll, rng);

    case 'LEAVE':
      // Partir : la seule victoire contre le Ghosteur. On garde l'Espoir qu'on
      // a. N'a de sens que face à un blind qui ne se gagne pas en jouant.
      if (blind.kind !== 'silent-decay') return state;
      return { ...state, status: 'won', log: [...state.log, 'Vous avez retiré votre candidature.'] };
  }
}

function playCard(state: GameState, uid: string, blind: Blind): GameState {
  const inst = state.hand.find((c) => c.uid === uid);
  if (!inst) return state;
  const def = CARD_DEFS[inst.defId];
  if (!def) return state;
  if (!canPlay(state, def, blind)) return state; // énergie ET blocage ATS

  const after = resolveEffects(state, def.effects);
  return {
    ...after,
    energy: after.energy - def.cost,
    hand: after.hand.filter((c) => c.uid !== uid),
    discardPile: [...after.discardPile, inst],
    playedThisTurn: true,
    log: [...after.log, `Jouée : ${def.name}`],
  };
}

function resolveTurnEnd(state: GameState, blind: Blind, roll: number, rng: Rng): GameState {
  // Le Ghosteur ne « tape » pas : il attend. L'Espoir se décompose seul, sans
  // roll, d'autant plus vite qu'il est haut. Aucun seuil à atteindre — la seule
  // issue est Partir (action LEAVE). Ici on ne fait que dérouler le silence.
  if (blind.kind === 'silent-decay') return resolveSilentDecay(state, blind, rng);

  // Pas de garde-fou « hope > 0 » (bug v2) : à Espoir nul, computeRisk vaut
  // légitimement 0 — rien à espérer, rien à perdre. Ce chemin ne mène plus
  // à une victoire pour autant : voir classifyEnd().
  const risk = blind.computeRisk(state) * state.riskModifier;
  const triggered = roll < risk;

  let next = state;
  if (triggered) {
    const before = next.hope;
    const reduction = next.shield ?? BREAK_REDUCTION_DEFAULT;
    next = {
      ...next,
      hope: Math.floor(next.hope * reduction),
      shield: null,
      breaksCount: next.breaksCount + 1,
      lastBreakFrom: before,
      log: [...next.log, `${blind.name}. Vous étiez à ${before}.`],
    };
    if (next.breaksCount >= BREAKS_TO_LOSE) {
      return { ...next, status: 'lost', lostReason: 'shattered' };
    }
  } else {
    next = { ...next, lastBreakFrom: null };
  }

  const turnDone = next.turn + 1;

  // Fin de run : le SEUIL est vérifié APRÈS le dernier jet — le dernier
  // mail peut encore arriver. C'est cruel, et c'est exact.
  if (turnDone > blind.maxTurns) {
    return { ...next, turn: turnDone, ...classifyEnd(next, blind) };
  }

  // Nouveau tour : main défaussée, repioche, énergie pleine, et riskModifier
  // remis à 1 INCONDITIONNELLEMENT, quel que soit le chemin (bug v2 corrigé
  // par construction : il n'existe qu'un seul endroit où un tour commence).
  const advanced: GameState = {
    ...next,
    turn: turnDone,
    energy: next.energyMax,
    riskModifier: 1,
    playedThisTurn: false,
    discardPile: [...next.discardPile, ...next.hand],
    hand: [],
  };
  return draw(advanced, HAND_SIZE, rng);
}

function resolveSilentDecay(state: GameState, blind: Blind, rng: Rng): GameState {
  const decayed = blind.computeDecay ? blind.computeDecay(state) : state.hope;
  const next: GameState = {
    ...state,
    hope: decayed,
    playedThisTurn: false,
    lastBreakFrom: null,
    log: [...state.log, `Toujours aucune réponse. Votre Espoir retombe à ${decayed}.`],
  };
  const turnDone = next.turn + 1;

  // L'Espoir a fini de se décomposer, ou le temps a passé : le silence a gagné.
  // Statut perdu, mais SANS ligne de mort — l'UI ne montre rien (retour au menu).
  // Le contraste avec l'ATS qui parle est toute la caractérisation.
  if (decayed <= 0 || turnDone > blind.maxTurns) {
    return { ...next, turn: turnDone, status: 'lost', lostReason: null };
  }

  const advanced: GameState = {
    ...next,
    turn: turnDone,
    energy: next.energyMax,
    riskModifier: 1,
    discardPile: [...next.discardPile, ...next.hand],
    hand: [],
  };
  return draw(advanced, HAND_SIZE, rng);
}

function classifyEnd(
  state: GameState,
  blind: Blind,
): { status: RunStatus; lostReason: GameState['lostReason'] } {
  if (state.hope >= blind.seuil) return { status: 'won', lostReason: null };
  if (state.hopeGeneratedTotal < HOPE_ENGAGEMENT_THRESHOLD)
    return { status: 'passive', lostReason: null };
  return { status: 'lost', lostReason: 'belowSeuil' };
}

/** Pioche n cartes ; remélange la défausse quand la pioche est vide. */
function draw(state: GameState, n: number, rng: Rng): GameState {
  let drawPile = [...state.drawPile];
  let discardPile = [...state.discardPile];
  const hand = [...state.hand];

  for (let i = 0; i < n; i++) {
    if (drawPile.length === 0) {
      if (discardPile.length === 0) break;
      drawPile = shuffle(discardPile, rng);
      discardPile = [];
    }
    const card = drawPile.shift();
    if (!card) break;
    hand.push(card);
  }
  return { ...state, drawPile, discardPile, hand };
}
