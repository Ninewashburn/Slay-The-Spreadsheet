import type { CardDef, CardInstance, Rng } from './types';
import { shuffle } from './rng';

/**
 * La banque du slice — 12 définitions distinctes. Règle d'extraction (CLAUDE.md
 * §3) : chaque carte est la traduction LITTÉRALE d'une phrase réellement reçue,
 * la mécanique EST la blague.
 *
 * Le mot-clé `Autonome` est la satire de l'ATS : la machine ne lit pas la
 * sincérité (« l'entretien s'est très bien passé »), seulement les mots
 * bourrés dans le dossier. Les cartes qui portent `Autonome` passent le filtre ;
 * les cartes humaines, plus vraies, sont bloquées.
 */
export const CARD_DEFS: Record<string, CardDef> = {
  // --- Passent l'ATS (portent le mot exact) : le dossier optimisé machine ---
  'candidature-envoyee': {
    id: 'candidature-envoyee',
    name: 'Candidature envoyée',
    cost: 1,
    effects: [{ kind: 'addHope', amount: 8 }],
    flavor: 'Votre candidature a bien été transmise au service concerné.',
    keywords: ['Autonome'],
  },
  'cv-optimise': {
    id: 'cv-optimise',
    name: 'CV optimisé mots-clés',
    cost: 1,
    effects: [{ kind: 'addHope', amount: 8 }],
    flavor: 'Vous avez recopié l’offre dans votre CV. La machine reconnaît les siens.',
    keywords: ['Autonome'],
  },
  'profil-recherche': {
    id: 'profil-recherche',
    name: 'Profil activement recherché',
    cost: 2,
    effects: [{ kind: 'multiplyHope', factor: 2, baseIfZero: 16 }],
    flavor: 'Un message automatique vous informe que votre profil correspond.',
    keywords: ['Autonome'],
  },
  certification: {
    id: 'certification',
    name: 'Certification en ligne',
    cost: 1,
    effects: [{ kind: 'addHope', amount: 5 }],
    flavor: 'Suivie en une après-midi. Ajoute une ligne. Coche une case.',
    keywords: ['Autonome'],
  },
  portfolio: {
    id: 'portfolio',
    name: 'Portfolio en ligne',
    cost: 2,
    effects: [{ kind: 'multiplyHope', factor: 2, baseIfZero: 14 }],
    flavor: 'Tout votre travail, rangé, présenté, accessible. Personne ne l’ouvrira.',
    keywords: ['Autonome'],
  },
  'mot-cle-exact': {
    id: 'mot-cle-exact',
    name: 'Mot-clé Exact',
    cost: 1,
    effects: [{ kind: 'shieldNextBreak', reduction: 0.35 }],
    flavor: 'Passe le filtre. Ne rapporte rien. Ne promet rien. Fonctionne.',
    keywords: ['Autonome'],
  },

  // --- Bloquées par l'ATS (aucun mot-clé) : vos vraies qualités, illisibles ---
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
  'relance-polie': {
    id: 'relance-polie',
    name: 'Relance polie',
    cost: 1,
    effects: [{ kind: 'reduceRiskThisTurn', factor: 0.6 }],
    flavor: 'Une relance courte et posée à J+10 est légitime.',
  },
  'banniere-nebuleuse': {
    id: 'banniere-nebuleuse',
    name: 'Bannière « Ouvert aux opportunités »',
    cost: 0,
    effects: [{ kind: 'addHope', amount: 6 }],
    flavor: 'Un cercle vert autour de votre photo. Vous vous sentez déjà mieux.',
  },
  mutuelle: {
    id: 'mutuelle',
    name: "Mutuelle d'entreprise",
    cost: 1,
    effects: [{ kind: 'addHope', amount: 5 }],
    flavor: 'Présentée comme un avantage. Obligatoire pour tout employeur depuis 2016.',
  },
  babyfoot: {
    id: 'babyfoot',
    name: 'Babyfoot dans la salle de pause',
    cost: 0,
    effects: [{ kind: 'addHope', amount: 4 }],
    flavor: 'La photo de couverture de l’annonce. Personne n’y joue jamais.',
  },
};

/** Le deck de départ du profil Junior : une de chaque, 12 cartes distinctes. */
export const DECKLIST: ReadonlyArray<readonly [string, number]> = [
  ['candidature-envoyee', 1],
  ['cv-optimise', 1],
  ['profil-recherche', 1],
  ['certification', 1],
  ['portfolio', 1],
  ['mot-cle-exact', 1],
  ['entretien-positif', 1],
  ['poste-correspond', 1],
  ['relance-polie', 1],
  ['banniere-nebuleuse', 1],
  ['mutuelle', 1],
  ['babyfoot', 1],
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
