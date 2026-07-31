import type {
  Action,
  Blind,
  BlindState,
  CardDef,
  CardInstance,
  GameState,
  Offer,
  Rng,
  RunStatus,
} from './types';
import { CARD_DEFS } from './cards';
import { resolveEffects } from './effects';
import { shuffle } from './rng';
import { gravityFor, pickWord } from './words';

/**
 * Une carte est BLOQUÉE si le blind est un ATS (`word-trigger`) et que la carte
 * ne porte pas son mot exact. Bloquée = injouable, pas affaiblie.
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

/** Partir n'existe que face aux blinds qui ne se gagnent pas en jouant. */
export function canLeave(state: GameState, blind: Blind): boolean {
  if (state.blindState.leaveLocked) return false; // « On est une famille »
  return blind.kind === 'silent-decay' || blind.kind === 'no-resolution';
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
/** Une exigence non couverte coûte un quart de l'Espoir (Mouton à Cinq Pattes). */
export const DEMAND_PENALTY = 0.25;

const EMPTY_BLIND_STATE: BlindState = {
  demands: [],
  transparent: false,
  layer: 0,
  reward: 0,
  bypassed: false,
  numbersAnnounced: 0,
  intent: null,
  lockedCategories: [],
  leaveLocked: false,
};

/**
 * @param opts.startingHope Espoir reporté d'un blind au suivant dans une run.
 * Compté dans le cumul généré : arriver avec de l'Espoir n'est pas de la passivité.
 * @param opts.blind Sert à initialiser l'état propre au blind (récompense…).
 * @param opts.offer Les « avantages » de l'offre SONT des règles : le red flag
 * peut retirer de l'Énergie ou verrouiller l'action Partir.
 */
export function createInitialState(
  deck: readonly CardInstance[],
  rng: Rng,
  opts?: { readonly startingHope?: number; readonly blind?: Blind; readonly offer?: Offer },
): GameState {
  const startingHope = opts?.startingHope ?? 0;
  const modifier = opts?.offer?.redFlag.modifier;
  const energyMax = Math.max(
    1,
    ENERGY_MAX + (modifier?.kind === 'energyDelta' ? modifier.delta : 0),
  );

  const base: GameState = {
    hope: startingHope,
    hopeGeneratedTotal: startingHope,
    energy: energyMax,
    energyMax,
    turn: 1,
    drawPile: deck,
    discardPile: [],
    hand: [],
    playedThisTurn: false,
    cardsPlayedTotal: 0,
    shield: null,
    riskModifier: 1,
    breaksCount: 0,
    status: 'playing',
    lostReason: null,
    lastBreakFrom: null,
    blindState: {
      ...EMPTY_BLIND_STATE,
      reward: opts?.blind?.rewardStart ?? 0,
      leaveLocked: modifier?.kind === 'lockLeave',
    },
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
      // Partir : la victoire contre le Ghosteur et le Poste Fictif. On garde
      // l'Espoir qu'on a. « On est une famille » retire cette sortie.
      if (!canLeave(state, blind)) return state;
      return {
        ...state,
        status: 'won',
        log: [...state.log, 'Vous avez retiré votre candidature.'],
      };
  }
}

function playCard(state: GameState, uid: string, blind: Blind): GameState {
  const inst = state.hand.find((c) => c.uid === uid);
  if (!inst) return state;
  const def = CARD_DEFS[inst.defId];
  if (!def) return state;
  if (!canPlay(state, def, blind)) return state; // énergie ET blocage ATS

  const after = resolveEffects(state, def.effects);
  // Face aux Prétentions Salariales, chaque carte jouée est un chiffre annoncé.
  const announced =
    blind.kind === 'number-first'
      ? after.blindState.numbersAnnounced + 1
      : after.blindState.numbersAnnounced;

  return {
    ...after,
    energy: after.energy - def.cost,
    // La carte peut avoir été retirée de la main par son propre effet (Exclusivité).
    hand: after.hand.filter((c) => c.uid !== uid),
    discardPile: after.hand.some((c) => c.uid === uid)
      ? [...after.discardPile, inst]
      : after.discardPile,
    playedThisTurn: true,
    cardsPlayedTotal: after.cardsPlayedTotal + 1,
    blindState: { ...after.blindState, numbersAnnounced: announced },
    log: [...after.log, `Jouée : ${def.name}`],
  };
}

/** Dispatch par famille de blind. Un seul endroit où un tour se termine. */
function resolveTurnEnd(state: GameState, blind: Blind, roll: number, rng: Rng): GameState {
  switch (blind.kind) {
    case 'silent-decay':
      return resolveSilentDecay(state, blind, rng);
    case 'escalating-demands':
      return resolveEscalatingDemands(state, blind, rng);
    case 'nested-layers':
      return resolveNestedLayers(state, blind, rng);
    case 'no-resolution':
      return resolveNoResolution(state, blind, rng);
    case 'scripted-loss':
      return resolveScriptedLoss(state, blind, rng);
    default:
      return resolveRisk(state, blind, roll, rng);
  }
}

/** Le chemin historique : un risque, un jet, une casse éventuelle. */
function resolveRisk(state: GameState, blind: Blind, roll: number, rng: Rng): GameState {
  // Pas de garde-fou « hope > 0 » (bug v2) : à Espoir nul, computeRisk vaut
  // légitimement 0 — rien à espérer, rien à perdre. Ce chemin ne mène plus
  // à une victoire pour autant : voir classifyEnd().
  const risk = blind.computeRisk(state) * state.riskModifier;
  const triggered = roll < risk;

  let next = state;
  if (triggered) {
    const before = next.hope;
    const reduction = next.shield ?? BREAK_REDUCTION_DEFAULT;
    // Le mot pivot tombe AVANT la phrase : le joueur averti sait déjà.
    const word = pickWord(gravityFor(before, blind.seuil), rng);
    next = {
      ...next,
      hope: Math.floor(next.hope * reduction),
      shield: null,
      breaksCount: next.breaksCount + 1,
      lastBreakFrom: before,
      blindState: { ...next.blindState, intent: word },
      log: [...next.log, `${word}. Vous étiez à ${before}.`],
    };
    if (next.breaksCount >= BREAKS_TO_LOSE) {
      return { ...next, status: 'lost', lostReason: 'shattered' };
    }
  } else {
    next = { ...next, lastBreakFrom: null, blindState: { ...next.blindState, intent: null } };
  }

  const turnDone = next.turn + 1;

  // Fin de run : le SEUIL est vérifié APRÈS le dernier jet — le dernier
  // mail peut encore arriver. C'est cruel, et c'est exact.
  if (turnDone > blind.maxTurns) {
    return { ...next, turn: turnDone, ...classifyEnd(next, blind) };
  }
  return advanceTurn(next, turnDone, rng);
}

/**
 * Le Ghosteur : il n'attaque pas, il attend. L'Espoir se décompose seul, sans
 * roll, d'autant plus vite qu'il est haut. La seule issue est Partir.
 */
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

  // Statut perdu, mais SANS ligne de mort : l'UI ne montre rien, retour au menu.
  if (decayed <= 0 || turnDone > blind.maxTurns) {
    return { ...next, turn: turnDone, status: 'lost', lostReason: null };
  }
  return advanceTurn(next, turnDone, rng);
}

/**
 * Le Mouton à Cinq Pattes : chaque tour révèle une exigence de plus. Sans
 * Transparence assumée, toute exigence que le deck ne couvre pas ampute
 * l'Espoir. La liste étant infinie, tout couvrir est impossible par
 * construction : la lucidité est la seule sortie.
 */
function resolveEscalatingDemands(state: GameState, blind: Blind, rng: Rng): GameState {
  const pool = blind.demandPool ?? [];
  const demand = pool[Math.floor(rng() * pool.length)] ?? '';
  const covered = deckCovers(state, demand);

  let next: GameState = {
    ...state,
    blindState: { ...state.blindState, demands: [...state.blindState.demands, demand] },
    log: [...state.log, `Ah, et une très forte expertise en ${demand}.`],
  };

  if (!next.blindState.transparent && !covered && next.hope > 0) {
    const before = next.hope;
    const after = Math.floor(before * (1 - DEMAND_PENALTY));
    next = {
      ...next,
      hope: after,
      lastBreakFrom: before,
      log: [...next.log, `Vous ne cochez pas cette case. Votre dossier retombe à ${after}.`],
    };
  } else {
    next = { ...next, lastBreakFrom: null };
  }

  const turnDone = next.turn + 1;
  if (turnDone > blind.maxTurns) {
    return { ...next, turn: turnDone, ...classifyEnd(next, blind) };
  }
  return advanceTurn(next, turnDone, rng);
}

/** Le deck entier (main, pioche, défausse) couvre-t-il cette exigence ? */
function deckCovers(state: GameState, demand: string): boolean {
  const all = [...state.hand, ...state.drawPile, ...state.discardPile];
  return all.some((c) => (CARD_DEFS[c.defId]?.covers ?? []).includes(demand));
}

/** Le seuil courant d'un blind à couches : il monte à chaque étage franchi. */
export function currentSeuil(state: GameState, blind: Blind): number {
  if (blind.kind !== 'nested-layers') return blind.seuil;
  return blind.seuil + state.blindState.layer * (blind.layerSeuilStep ?? 0);
}

/**
 * La Poupée Russe : aucun PV. Franchir une couche RELÈVE le seuil et fait fondre
 * la récompense ; le compteur de tours ne se réinitialise pas. On peut aller au
 * bout (endurance) ou court-circuiter la chaîne avec Contact direct.
 */
function resolveNestedLayers(state: GameState, blind: Blind, rng: Rng): GameState {
  if (state.blindState.bypassed) {
    return { ...state, status: 'won', log: [...state.log, 'Vous avez sauté la chaîne.'] };
  }

  const target = currentSeuil(state, blind);
  const layers = blind.layers ?? 1;
  let next = state;

  if (state.hope >= target) {
    const layer = state.blindState.layer + 1;
    const reward = Math.floor(state.blindState.reward * (blind.rewardKeptPerLayer ?? 1));
    if (layer >= layers) {
      return {
        ...state,
        blindState: { ...state.blindState, layer, reward },
        status: 'won',
      };
    }
    next = {
      ...state,
      blindState: { ...state.blindState, layer, reward },
      log: [...state.log, 'Votre profil est transmis à l’interlocuteur suivant.'],
    };
  }

  const turnDone = next.turn + 1;
  if (turnDone > blind.maxTurns) {
    return { ...next, turn: turnDone, status: 'lost', lostReason: 'belowSeuil' };
  }
  return advanceTurn(next, turnDone, rng);
}

/**
 * Le Poste Fictif : rien ne se résout. Le système répond poliment et ne décide
 * jamais. Tout l'Espoir investi ici s'évapore à la fermeture du ticket. Ce n'est
 * PAS une défaite scriptée : retirer sa candidature conserve l'Espoir.
 */
function resolveNoResolution(state: GameState, blind: Blind, rng: Rng): GameState {
  const next: GameState = {
    ...state,
    lastBreakFrom: null,
    log: [...state.log, 'Votre candidature suit son cours.'],
  };
  const turnDone = next.turn + 1;
  if (turnDone > blind.maxTurns) {
    return { ...next, turn: turnDone, hope: 0, status: 'lost', lostReason: 'belowSeuil' };
  }
  return advanceTurn(next, turnDone, rng);
}

/**
 * Le Manager qui a Pris un Senior : tout réussit, le risque est nul, et la
 * défaite est écrite. L'UNIQUE boss sans sortie du jeu (CLAUDE.md §2).
 */
function resolveScriptedLoss(state: GameState, blind: Blind, rng: Rng): GameState {
  const next: GameState = { ...state, lastBreakFrom: null };
  const turnDone = next.turn + 1;
  if (turnDone > blind.maxTurns) {
    return { ...next, turn: turnDone, status: 'lost', lostReason: 'scripted' };
  }
  return advanceTurn(next, turnDone, rng);
}

/**
 * Nouveau tour : main défaussée, repioche, énergie pleine, et riskModifier remis
 * à 1 INCONDITIONNELLEMENT (bug v2 corrigé par construction : il n'existe qu'un
 * seul endroit où un tour commence).
 */
function advanceTurn(state: GameState, turnDone: number, rng: Rng): GameState {
  const advanced: GameState = {
    ...state,
    turn: turnDone,
    energy: state.energyMax,
    riskModifier: 1,
    playedThisTurn: false,
    discardPile: [...state.discardPile, ...state.hand],
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
