import type { CardDef, CardInstance, Rng } from './types';
import { shuffle } from './rng';

/**
 * La banque du slice. Règle d'extraction (CLAUDE.md) : chaque carte est la
 * traduction LITTÉRALE d'une phrase réellement reçue — la mécanique EST la
 * blague, jamais une vanne plaquée sur une règle.
 */
export const CARD_DEFS: Record<string, CardDef> = {
  'entretien-positif': {
    id: 'entretien-positif',
    name: "L'entretien s'est très bien passé",
    cost: 1,
    effects: [{ kind: 'multiplyHope', factor: 2, baseIfZero: 16 }],
    flavor: 'Impression positive rapportée après un échange oral. Aucune valeur contractuelle.',
  },
  'poste-correspond': {
    id: 'poste-correspond',
    name: 'Le poste correspond exactement',
    cost: 2,
    effects: [{ kind: 'multiplyHope', factor: 3, baseIfZero: 24 }],
    flavor: "L'annonce semble écrite pour vous. C'est précisément ce qui devrait vous inquiéter.",
  },
  'candidature-envoyee': {
    id: 'candidature-envoyee',
    name: 'Candidature envoyée',
    cost: 1,
    effects: [{ kind: 'addHope', amount: 8 }],
    flavor: 'Votre candidature a bien été transmise au service concerné.',
  },
  'mot-cle-exact': {
    id: 'mot-cle-exact',
    name: 'Mot-clé Exact',
    cost: 1,
    effects: [{ kind: 'shieldNextBreak', reduction: 0.35 }],
    flavor: 'Passe le filtre. Ne rapporte rien. Ne promet rien. Fonctionne.',
  },
  'relance-polie': {
    id: 'relance-polie',
    name: 'Relance polie',
    cost: 1,
    effects: [{ kind: 'reduceRiskThisTurn', factor: 0.6 }],
    flavor: 'Une relance courte et posée à J+10 est légitime.',
  },
};

/** Composition du deck de départ du profil Junior (12 cartes, doublons voulus). */
export const DECKLIST: ReadonlyArray<readonly [string, number]> = [
  ['entretien-positif', 3],
  ['poste-correspond', 2],
  ['candidature-envoyee', 2],
  ['mot-cle-exact', 3],
  ['relance-polie', 2],
];

/** Construit et mélange le deck. Chaque doublon reçoit son uid propre. */
export function buildDeck(rng: Rng): readonly CardInstance[] {
  const deck: CardInstance[] = [];
  let uid = 0;
  for (const [defId, count] of DECKLIST) {
    for (let i = 0; i < count; i++) {
      deck.push({ uid: `c${uid}`, defId });
      uid += 1;
    }
  }
  return shuffle(deck, rng);
}
