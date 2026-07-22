import { describe, expect, it } from 'vitest';
import type { Blind, CardDef, GameState } from '../types';
import { mulberry32 } from '../rng';
import { buildDeck, CARD_DEFS } from '../cards';
import { ats, ghosteur, recruteur } from '../blinds';
import { applyAction, canPlay, createInitialState, HAND_SIZE, isBlocked } from '../reducer';

/** Une partie fraîche, déterministe. */
function freshGame(seed = 42) {
  const rng = mulberry32(seed);
  const state = createInitialState(buildDeck(rng), rng);
  return { state, rng };
}

/** Force un état précis sans dépendre de la pioche (tests de classification). */
function withOverrides(state: GameState, overrides: Partial<GameState>): GameState {
  return { ...state, ...overrides };
}

describe('non-régression — les 3 bugs trouvés en playtest sur le proto', () => {
  it("bug v2 n°1 : la passivité totale (5x Passer, Espoir 0) n'est plus une victoire", () => {
    let { state } = freshGame();
    const rng = mulberry32(1);
    for (let i = 0; i < 5; i++) {
      state = applyAction(state, { type: 'PASS_TURN', roll: 0.99 }, recruteur, rng);
    }
    expect(state.status).toBe('passive');
    expect(state.hopeGeneratedTotal).toBe(0);
  });

  it('bug v2 n°2 : la réduction de risque de Passer ne colle plus au tour suivant', () => {
    let { state } = freshGame();
    const rng = mulberry32(2);
    state = applyAction(state, { type: 'PASS_TURN', roll: 0.99 }, recruteur, rng);
    // Nouveau tour : le modificateur est revenu à 1, inconditionnellement.
    expect(state.riskModifier).toBe(1);
  });

  it("bug v2 n°3 : à Espoir 0 le risque vaut 0 par la règle, pas par un garde-fou codé en dur", () => {
    const { state } = freshGame();
    expect(state.hope).toBe(0);
    expect(recruteur.computeRisk(state)).toBe(0);
  });
});

describe('le seuil — la moitié « score » de la thèse (v4)', () => {
  it("finir AU-DESSUS du seuil avec un engagement réel → victoire", () => {
    const { state } = freshGame();
    const rng = mulberry32(3);
    const late = withOverrides(state, { hope: 60, hopeGeneratedTotal: 60, turn: recruteur.maxTurns });
    const done = applyAction(late, { type: 'END_TURN', roll: 0.99 }, recruteur, rng);
    expect(done.status).toBe('won');
  });

  it('finir SOUS le seuil malgré un engagement réel → défaite « belowSeuil »', () => {
    const { state } = freshGame();
    const rng = mulberry32(4);
    const late = withOverrides(state, { hope: 30, hopeGeneratedTotal: 90, turn: recruteur.maxTurns });
    const done = applyAction(late, { type: 'END_TURN', roll: 0.99 }, recruteur, rng);
    expect(done.status).toBe('lost');
    expect(done.lostReason).toBe('belowSeuil');
  });

  it('le seuil est vérifié APRÈS le dernier jet : le dernier mail peut encore tout casser', () => {
    const { state } = freshGame();
    const rng = mulberry32(5);
    // 60 ≥ seuil… mais le roll déclenche la casse au dernier tour : 60 → 6, sous le seuil.
    const late = withOverrides(state, { hope: 60, hopeGeneratedTotal: 60, turn: recruteur.maxTurns });
    const done = applyAction(late, { type: 'END_TURN', roll: 0.0 }, recruteur, rng);
    expect(done.status).toBe('lost');
    expect(done.lostReason).toBe('belowSeuil');
    expect(done.hope).toBe(6);
  });
});

describe('la casse', () => {
  it('deux casses → défaite « shattered », la ligne de mort du blind', () => {
    const { state } = freshGame();
    const rng = mulberry32(6);
    const risky = withOverrides(state, { hope: 100, hopeGeneratedTotal: 100, breaksCount: 1 });
    const done = applyAction(risky, { type: 'END_TURN', roll: 0.0 }, recruteur, rng);
    expect(done.status).toBe('lost');
    expect(done.lostReason).toBe('shattered');
  });

  it('le bouclier (Mot-clé Exact) adoucit la casse : ×0.35 au lieu de ×0.1', () => {
    const { state } = freshGame();
    const rng = mulberry32(7);
    const shielded = withOverrides(state, { hope: 100, hopeGeneratedTotal: 100, shield: 0.35 });
    const broken = applyAction(shielded, { type: 'END_TURN', roll: 0.0 }, recruteur, rng);
    expect(broken.hope).toBe(35);
    expect(broken.shield).toBeNull(); // consommé

    const bare = withOverrides(state, { hope: 100, hopeGeneratedTotal: 100 });
    const brokenBare = applyAction(bare, { type: 'END_TURN', roll: 0.0 }, recruteur, rng);
    expect(brokenBare.hope).toBe(10);
  });
});

describe('les actions', () => {
  it('Passer est refusé après avoir joué une carte ce tour (sinon il dominerait)', () => {
    let { state } = freshGame();
    const rng = mulberry32(8);
    const first = state.hand[0];
    expect(first).toBeDefined();
    state = applyAction(state, { type: 'PLAY_CARD', uid: first!.uid }, recruteur, rng);
    expect(state.playedThisTurn).toBe(true);
    const after = applyAction(state, { type: 'PASS_TURN', roll: 0.5 }, recruteur, rng);
    expect(after).toBe(state); // état strictement inchangé : l'action est rejetée
  });

  it("jouer une carte coûte de l'Énergie et la déplace vers la défausse", () => {
    const { state } = freshGame();
    const rng = mulberry32(9);
    const first = state.hand[0];
    expect(first).toBeDefined();
    const next = applyAction(state, { type: 'PLAY_CARD', uid: first!.uid }, recruteur, rng);
    expect(next.hand).toHaveLength(HAND_SIZE - 1);
    expect(next.discardPile.map((c) => c.uid)).toContain(first!.uid);
    expect(next.energy).toBeLessThan(state.energy);
  });
});

describe('la pioche (v4)', () => {
  it('la main est repiochée à 3 chaque tour et aucune carte ne disparaît du jeu', () => {
    let { state } = freshGame();
    const rng = mulberry32(10);
    const total = state.drawPile.length + state.hand.length + state.discardPile.length;
    expect(total).toBe(12);

    for (let i = 0; i < 4 && state.status === 'playing'; i++) {
      state = applyAction(state, { type: 'END_TURN', roll: 0.99 }, recruteur, rng);
      if (state.status !== 'playing') break;
      expect(state.hand).toHaveLength(HAND_SIZE);
      const conserved = state.drawPile.length + state.hand.length + state.discardPile.length;
      expect(conserved).toBe(12); // la défausse se remélange, rien ne se perd
    }
  });
});

describe("l'ATS — word-trigger : bloque, n'affaiblit pas (V0.5)", () => {
  const handOf = (state: GameState, defId: string): GameState => ({
    ...state,
    hand: [{ uid: 'x', defId }],
    energy: 3,
  });

  it('une carte sans le mot exact est BLOQUÉE : injouable, état inchangé', () => {
    const { state } = freshGame();
    const rng = mulberry32(20);
    // entretien-positif ne porte aucun mot-clé : l'ATS ne le lit pas.
    const s = handOf(state, 'entretien-positif');
    expect(isBlocked(CARD_DEFS['entretien-positif']!, ats)).toBe(true);
    const after = applyAction(s, { type: 'PLAY_CARD', uid: 'x' }, ats, rng);
    expect(after).toBe(s); // strictement rien : la carte est grisée, pas jouée
  });

  it('le mot exact débloque la carte : elle se joue normalement', () => {
    const { state } = freshGame();
    const rng = mulberry32(21);
    // candidature-envoyee porte « Autonome », le mot exigé par l'ATS.
    const s = handOf(state, 'candidature-envoyee');
    expect(canPlay(s, CARD_DEFS['candidature-envoyee']!, ats)).toBe(true);
    const after = applyAction(s, { type: 'PLAY_CARD', uid: 'x' }, ats, rng);
    expect(after.hope).toBe(8);
    expect(after.hand).toHaveLength(0);
  });

  it('le match est EXACT : « AngularJS » ne satisfait pas « Angular »', () => {
    const wordBlind: Blind = { ...ats, requiredKeyword: 'Angular' };
    const almost: CardDef = { id: 'a', name: 'a', cost: 1, effects: [], keywords: ['AngularJS'] };
    const exact: CardDef = { id: 'b', name: 'b', cost: 1, effects: [], keywords: ['Angular'] };
    expect(isBlocked(almost, wordBlind)).toBe(true);
    expect(isBlocked(exact, wordBlind)).toBe(false);
  });

  it('hors word-trigger, aucun blocage : le Recruteur lit toutes les cartes', () => {
    expect(isBlocked(CARD_DEFS['entretien-positif']!, recruteur)).toBe(false);
  });
});

describe('le Ghosteur — silent-decay : il attend, il ne tape pas (V0.5)', () => {
  it("l'Espoir se décompose d'autant plus vite qu'il est haut", () => {
    const fracLost = (hope: number): number => (hope - ghosteur.computeDecay!({ hope } as GameState)) / hope;
    expect(fracLost(100)).toBeGreaterThan(fracLost(20));
  });

  it('END_TURN décompose sans jamais casser (breaksCount reste à 0)', () => {
    const { state } = freshGame();
    const rng = mulberry32(30);
    const s = withOverrides(state, { hope: 40, hopeGeneratedTotal: 40 });
    const after = applyAction(s, { type: 'END_TURN', roll: 0.0 }, ghosteur, rng);
    expect(after.hope).toBeLessThan(40);
    expect(after.breaksCount).toBe(0); // le silence ne « tape » pas
  });

  it("Partir (LEAVE) est la seule victoire : l'Espoir est conservé", () => {
    const { state } = freshGame();
    const rng = mulberry32(31);
    const s = withOverrides(state, { hope: 33, hopeGeneratedTotal: 33 });
    const left = applyAction(s, { type: 'LEAVE' }, ghosteur, rng);
    expect(left.status).toBe('won');
    expect(left.hope).toBe(33); // partir tôt = garder son Espoir
  });

  it('LEAVE ne fait rien contre un blind qui se joue (Recruteur)', () => {
    const { state } = freshGame();
    const rng = mulberry32(32);
    expect(applyAction(state, { type: 'LEAVE' }, recruteur, rng)).toBe(state);
  });

  it("laisser l'Espoir se décomposer jusqu'au bout finit la run, sans ligne de mort", () => {
    let { state } = freshGame();
    const rng = mulberry32(33);
    state = withOverrides(state, { hope: 12, hopeGeneratedTotal: 12 });
    for (let i = 0; i < 12 && state.status === 'playing'; i++) {
      state = applyAction(state, { type: 'END_TURN', roll: 0.9 }, ghosteur, rng);
    }
    expect(state.status).toBe('lost');
    expect(state.lostReason).toBeNull(); // aucune ligne de mort : retour au menu, silence
  });
});

describe('la run — report de l\'Espoir entre blinds (V0.5)', () => {
  it("on arrive chez le Ghosteur avec l'Espoir gagné à l'ATS (pas de passivité)", () => {
    const rng = mulberry32(40);
    const s = createInitialState(buildDeck(rng), rng, { startingHope: 26 });
    expect(s.hope).toBe(26);
    expect(s.hopeGeneratedTotal).toBe(26); // compté comme engagement réel
  });
});

describe('déterminisme — même seed, mêmes actions, même run', () => {
  it('deux parties identiques produisent des états strictement égaux', () => {
    const run = (seed: number): GameState => {
      const rng = mulberry32(seed);
      let s = createInitialState(buildDeck(rng), rng);
      const rolls = [0.9, 0.05, 0.9, 0.5, 0.9];
      for (const roll of rolls) {
        if (s.status !== 'playing') break;
        const first = s.hand[0];
        if (first) s = applyAction(s, { type: 'PLAY_CARD', uid: first.uid }, recruteur, rng);
        s = applyAction(s, { type: 'END_TURN', roll }, recruteur, rng);
      }
      return s;
    };
    expect(JSON.stringify(run(1234))).toBe(JSON.stringify(run(1234)));
  });
});
