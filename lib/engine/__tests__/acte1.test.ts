import { describe, expect, it } from 'vitest';
import type { GameState, Offer } from '../types';
import { mulberry32 } from '../rng';
import { buildActeIDeck, CARD_DEFS } from '../cards';
import {
  applyOffer,
  leManager,
  moutonCinqPattes,
  posteFictif,
  poupeeRusse,
  pretentionsSalariales,
} from '../blinds';
import { applyAction, canLeave, createInitialState, currentSeuil } from '../reducer';
import { generateJobBoard, generateOffer, generateRefusal } from '../generator';
import { gravityFor, INTENT_WORDS, pickWord } from '../words';
import {
  EMPTY_META,
  evaluateAchievements,
  grantRelicsAfterRun,
  mustReadFullRefusal,
} from '../meta';

function game(seed = 100, overrides: Partial<GameState> = {}) {
  const rng = mulberry32(seed);
  const state = createInitialState(buildActeIDeck(rng), rng);
  return { state: { ...state, ...overrides }, rng };
}

/** Force une main précise, sans dépendre de la pioche. */
function withHand(state: GameState, defId: string): GameState {
  return { ...state, hand: [{ uid: 'x', defId }], energy: 3 };
}

describe('le système des mots (les intents)', () => {
  it('les 12 mots couvrent toute l’échelle de gravité, du négociable au fatal', () => {
    expect(INTENT_WORDS).toHaveLength(12);
    expect(new Set(INTENT_WORDS.map((w) => w.gravity))).toEqual(new Set([1, 2, 3, 4, 5]));
  });

  it('plus l’Espoir dépasse le seuil, plus le mot annoncé est grave', () => {
    expect(gravityFor(10, 50)).toBeLessThan(gravityFor(45, 50));
    expect(gravityFor(45, 50)).toBeLessThan(gravityFor(150, 50));
  });

  it('le mot tiré appartient bien au palier demandé (déterministe)', () => {
    const word = pickWord(5, mulberry32(3));
    expect(INTENT_WORDS.find((w) => w.word === word)?.gravity).toBe(5);
  });
});

describe('le générateur par assemblage', () => {
  it('même seed, même job board (daily run gratuit)', () => {
    const a = generateJobBoard(mulberry32(7), ['ats', 'mouton', 'poupee']);
    const b = generateJobBoard(mulberry32(7), ['ats', 'mouton', 'poupee']);
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });

  it('une offre porte un red flag, des avantages et une fourchette au centime', () => {
    const offer = generateOffer(mulberry32(11), 'ats', 0);
    expect(offer.advantages.length).toBe(3);
    expect(offer.redFlag.label.length).toBeGreaterThan(0);
    expect(offer.salaryHigh).toBeGreaterThan(offer.salaryLow);
    // La fausse précision EST la blague : on ne doit jamais arrondir.
    expect(Number.isInteger(offer.salaryLow * 100)).toBe(true);
  });

  it('un refus contient son mot pivot, et le mot est annoncé à part', () => {
    const refusal = generateRefusal(mulberry32(13), 4);
    expect(refusal.body).toContain(refusal.pivot.toLowerCase());
    expect(refusal.body.length).toBeGreaterThan(40);
  });

  it('aucun texte généré ne contient de tiret cadratin ni de Markdown (CLAUDE.md §8)', () => {
    for (let seed = 0; seed < 40; seed++) {
      const offer = generateOffer(mulberry32(seed), 'ats', 0);
      const refusal = generateRefusal(mulberry32(seed), (seed % 5) + 1);
      const texts = [offer.title, offer.contract, ...offer.advantages, refusal.body];
      for (const t of texts) {
        expect(t).not.toContain('—');
        expect(t).not.toContain('**');
      }
    }
  });
});

describe('l’offre EST le niveau (les avantages sont des règles)', () => {
  const base = (modifier: Offer['redFlag']['modifier']): Offer => ({
    id: 'o',
    title: 't',
    contract: 'c',
    advantages: [],
    redFlag: { label: 'x', modifier },
    blindId: 'recruteur',
    salaryLow: 1,
    salaryHigh: 2,
  });

  it('« Polyvalent » relève le seuil exigé', () => {
    const tuned = applyOffer(moutonCinqPattes, base({ kind: 'seuilFactor', factor: 1.2 }));
    expect(tuned.seuil).toBeGreaterThan(moutonCinqPattes.seuil);
  });

  it('« Jeune équipe dynamique » retire un tour', () => {
    const tuned = applyOffer(moutonCinqPattes, base({ kind: 'turnsDelta', delta: -1 }));
    expect(tuned.maxTurns).toBe(moutonCinqPattes.maxTurns - 1);
  });

  it('« Autonome » retire de l’Énergie : personne ne vous aidera', () => {
    const rng = mulberry32(5);
    const s = createInitialState(buildActeIDeck(rng), rng, {
      offer: base({ kind: 'energyDelta', delta: -1 }),
    });
    expect(s.energyMax).toBe(2);
  });

  it('« On est une famille » verrouille l’action Partir', () => {
    const rng = mulberry32(6);
    const s = createInitialState(buildActeIDeck(rng), rng, {
      blind: posteFictif,
      offer: base({ kind: 'lockLeave' }),
    });
    expect(s.blindState.leaveLocked).toBe(true);
    expect(canLeave(s, posteFictif)).toBe(false);
    expect(applyAction(s, { type: 'LEAVE' }, posteFictif, rng)).toBe(s);
  });
});

describe('Le Mouton à Cinq Pattes — la Liste Infinie', () => {
  it('chaque tour révèle une exigence de plus', () => {
    const { state, rng } = game(20);
    const after = applyAction(state, { type: 'END_TURN', roll: 0.9 }, moutonCinqPattes, rng);
    expect(after.blindState.demands).toHaveLength(1);
    const after2 = applyAction(after, { type: 'END_TURN', roll: 0.9 }, moutonCinqPattes, rng);
    expect(after2.blindState.demands).toHaveLength(2);
  });

  it('le pool d’exigences reste universel : aucun terme technique (CLAUDE.md §3)', () => {
    const banned = ['docker', 'sql', 'git', 'react', 'rag', 'microservice', '.net', 'python'];
    for (const demand of moutonCinqPattes.demandPool ?? []) {
      expect(banned.some((b) => demand.toLowerCase().includes(b))).toBe(false);
    }
  });

  it('une exigence non couverte ampute l’Espoir', () => {
    const { state, rng } = game(21);
    // Deck vidé : plus rien ne couvre quoi que ce soit.
    const naked: GameState = { ...state, hope: 100, hand: [], drawPile: [], discardPile: [] };
    const after = applyAction(naked, { type: 'END_TURN', roll: 0.9 }, moutonCinqPattes, rng);
    expect(after.hope).toBeLessThan(100);
  });

  it('Transparence assumée neutralise la Liste Infinie pour le reste du combat', () => {
    const { state, rng } = game(22);
    const naked: GameState = { ...state, hope: 100, drawPile: [], discardPile: [] };
    const declared = applyAction(
      withHand(naked, 'transparence-assumee'),
      { type: 'PLAY_CARD', uid: 'x' },
      moutonCinqPattes,
      rng,
    );
    expect(declared.blindState.transparent).toBe(true);

    const after = applyAction(declared, { type: 'END_TURN', roll: 0.9 }, moutonCinqPattes, rng);
    expect(after.hope).toBe(100); // nommer ses lacunes protège
  });

  it('la carte de la victoire est GARANTIE dans le deck (garde-fou anti-arbitraire)', () => {
    const rng = mulberry32(23);
    const deck = buildActeIDeck(rng);
    const count = deck.filter((c) => c.defId === 'transparence-assumee').length;
    expect(count).toBeGreaterThanOrEqual(2);
  });
});

describe('La Poupée Russe — des couches, jamais des PV', () => {
  it('franchir une couche RELÈVE le seuil et fait fondre la récompense', () => {
    const rng = mulberry32(30);
    const start = createInitialState(buildActeIDeck(rng), rng, { blind: poupeeRusse });
    const seuil0 = currentSeuil(start, poupeeRusse);
    const rich: GameState = { ...start, hope: seuil0 + 5 };

    const after = applyAction(rich, { type: 'END_TURN', roll: 0.9 }, poupeeRusse, rng);
    expect(after.blindState.layer).toBe(1);
    expect(currentSeuil(after, poupeeRusse)).toBeGreaterThan(seuil0);
    expect(after.blindState.reward).toBeLessThan(start.blindState.reward);
  });

  it('le compteur de tours ne se réinitialise PAS entre les couches', () => {
    const rng = mulberry32(31);
    const start = createInitialState(buildActeIDeck(rng), rng, { blind: poupeeRusse });
    const rich: GameState = { ...start, hope: 999, turn: 3 };
    const after = applyAction(rich, { type: 'END_TURN', roll: 0.9 }, poupeeRusse, rng);
    expect(after.turn).toBe(4);
  });

  it('aucune casse, aucun PV : le blind ne tape jamais', () => {
    const rng = mulberry32(32);
    const start = createInitialState(buildActeIDeck(rng), rng, { blind: poupeeRusse });
    const after = applyAction({ ...start, hope: 5 }, { type: 'END_TURN', roll: 0 }, poupeeRusse, rng);
    expect(after.breaksCount).toBe(0);
    expect(after.hope).toBe(5);
  });

  it('Contact direct court-circuite la chaîne (voie de secours, jamais obligatoire)', () => {
    const rng = mulberry32(33);
    const start = createInitialState(buildActeIDeck(rng), rng, { blind: poupeeRusse });
    const played = applyAction(
      withHand(start, 'contact-direct'),
      { type: 'PLAY_CARD', uid: 'x' },
      poupeeRusse,
      rng,
    );
    expect(played.blindState.bypassed).toBe(true);
    const after = applyAction(played, { type: 'END_TURN', roll: 0.9 }, poupeeRusse, rng);
    expect(after.status).toBe('won');
  });

  it('on PEUT aller au bout par endurance (option B retenue)', () => {
    const rng = mulberry32(34);
    let s = createInitialState(buildActeIDeck(rng), rng, { blind: poupeeRusse });
    for (let i = 0; i < (poupeeRusse.layers ?? 3); i++) {
      s = { ...s, hope: currentSeuil(s, poupeeRusse) + 1 };
      s = applyAction(s, { type: 'END_TURN', roll: 0.9 }, poupeeRusse, rng);
    }
    expect(s.status).toBe('won');
    // La récompense a fondu à chaque intermédiaire.
    expect(s.blindState.reward).toBeLessThan(poupeeRusse.rewardStart ?? 100);
  });
});

describe('Prétentions Salariales — ne jamais parler en premier', () => {
  it('chaque carte jouée est un chiffre annoncé, et le risque monte avec', () => {
    const { state, rng } = game(40);
    const before = pretentionsSalariales.computeRisk(state);
    const played = applyAction(
      withHand(state, 'candidature-envoyee'),
      { type: 'PLAY_CARD', uid: 'x' },
      pretentionsSalariales,
      rng,
    );
    expect(played.blindState.numbersAnnounced).toBe(1);
    expect(pretentionsSalariales.computeRisk(played)).toBeGreaterThan(before);
  });

  it('se taire ne coûte rien : à zéro chiffre annoncé, le risque est nul', () => {
    const { state } = game(41, { hope: 300 });
    expect(pretentionsSalariales.computeRisk(state)).toBe(0);
  });

  it('ailleurs, jouer une carte n’annonce aucun chiffre', () => {
    const { state, rng } = game(42);
    const played = applyAction(
      withHand(state, 'candidature-envoyee'),
      { type: 'PLAY_CARD', uid: 'x' },
      moutonCinqPattes,
      rng,
    );
    expect(played.blindState.numbersAnnounced).toBe(0);
  });
});

describe('Le Poste Fictif — rien ne se résout', () => {
  it('l’Espoir investi s’évapore à la fermeture du ticket', () => {
    const rng = mulberry32(50);
    let s = createInitialState(buildActeIDeck(rng), rng, { blind: posteFictif });
    s = { ...s, hope: 80, hopeGeneratedTotal: 80 };
    for (let i = 0; i < posteFictif.maxTurns; i++) {
      s = applyAction(s, { type: 'END_TURN', roll: 0.9 }, posteFictif, rng);
    }
    expect(s.status).toBe('lost');
    expect(s.hope).toBe(0);
  });

  it('retirer sa candidature conserve l’Espoir : ce n’est PAS une défaite scriptée', () => {
    const rng = mulberry32(51);
    const s = createInitialState(buildActeIDeck(rng), rng, { blind: posteFictif });
    const left = applyAction({ ...s, hope: 44 }, { type: 'LEAVE' }, posteFictif, rng);
    expect(left.status).toBe('won');
    expect(left.hope).toBe(44);
  });
});

describe('Le Manager — l’unique défaite scriptée du jeu', () => {
  it('tout réussit, le risque est nul, et la défaite arrive quand même', () => {
    const rng = mulberry32(60);
    let s = createInitialState(buildActeIDeck(rng), rng, { blind: leManager });
    s = { ...s, hope: 999, hopeGeneratedTotal: 999 };
    for (let i = 0; i < leManager.maxTurns; i++) {
      s = applyAction(s, { type: 'END_TURN', roll: 0.99 }, leManager, rng);
    }
    expect(s.status).toBe('lost');
    expect(s.lostReason).toBe('scripted');
    expect(s.breaksCount).toBe(0);
  });

  it('il n’y a pas de sortie : Partir ne fonctionne pas contre lui', () => {
    const rng = mulberry32(61);
    const s = createInitialState(buildActeIDeck(rng), rng, { blind: leManager });
    expect(canLeave(s, leManager)).toBe(false);
    expect(applyAction(s, { type: 'LEAVE' }, leManager, rng)).toBe(s);
  });
});

describe('Exclusivité — le coût est une fermeture, pas un malus', () => {
  it('elle retire du run TOUTES les autres cartes de la catégorie visée', () => {
    const { state, rng } = game(70);
    const before = [...state.hand, ...state.drawPile, ...state.discardPile].filter(
      (c) => CARD_DEFS[c.defId]?.category === 'utilitaire',
    ).length;
    expect(before).toBeGreaterThan(0);

    const played = applyAction(
      withHand(state, 'exclusivite'),
      { type: 'PLAY_CARD', uid: 'x' },
      moutonCinqPattes,
      rng,
    );
    const after = [...played.hand, ...played.drawPile, ...played.discardPile].filter(
      (c) => CARD_DEFS[c.defId]?.category === 'utilitaire',
    ).length;
    expect(after).toBe(0);
    expect(played.blindState.lockedCategories).toContain('utilitaire');
  });

  it('son bonus immédiat est réel : elle doit être tentante', () => {
    const { state, rng } = game(71);
    const played = applyAction(
      withHand(state, 'exclusivite'),
      { type: 'PLAY_CARD', uid: 'x' },
      moutonCinqPattes,
      rng,
    );
    expect(played.hope).toBeGreaterThan(state.hope);
  });
});

describe('la méta-progression — le déblocage, c’est la connaissance', () => {
  it('run 1 : le mail de refus est imblocable. Ensuite, la relique le saute à jamais', () => {
    expect(mustReadFullRefusal(EMPTY_META)).toBe(true);
    const after = grantRelicsAfterRun(EMPTY_META);
    expect(mustReadFullRefusal(after)).toBe(false);
    // La relique ne se cumule pas.
    expect(grantRelicsAfterRun(after).relics).toHaveLength(1);
  });

  it('« Culture Fit » : perdre après avoir tout réussi', () => {
    const { state } = game(80);
    const lost: GameState = { ...state, status: 'lost', lostReason: 'scripted' };
    expect(evaluateAchievements(lost, leManager, EMPTY_META)).toContain('culture-fit');
  });

  it('« Jamais en premier » : gagner la négociation sans lâcher plus d’un chiffre', () => {
    const { state } = game(81);
    const won: GameState = {
      ...state,
      status: 'won',
      blindState: { ...state.blindState, numbersAnnounced: 1 },
    };
    expect(evaluateAchievements(won, pretentionsSalariales, EMPTY_META)).toContain(
      'jamais-parle-en-premier',
    );
  });

  it('un succès déjà obtenu n’est jamais redonné', () => {
    const { state } = game(82);
    const lost: GameState = { ...state, status: 'lost', lostReason: 'scripted' };
    const meta = { ...EMPTY_META, achievements: ['culture-fit'] };
    expect(evaluateAchievements(lost, leManager, meta)).not.toContain('culture-fit');
  });
});
