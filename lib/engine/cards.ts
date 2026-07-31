import type { CardDef, CardInstance, Rng } from './types';
import { shuffle } from './rng';

/**
 * La banque des cartes. Règle d'extraction (CLAUDE.md §3) : chaque carte est la
 * traduction LITTÉRALE d'une phrase réellement reçue, la mécanique EST la blague.
 *
 * `category` porte le code couleur (CLAUDE.md §6, lisibilité UNO) : bleu = gonfle
 * l'Espoir, vert = utilitaire, corail = piège. `covers` liste les exigences que
 * la carte satisfait face au Mouton à Cinq Pattes, en vocabulaire universel.
 */
export const CARD_DEFS: Record<string, CardDef> = {
  // --- Passent l'ATS (portent le mot exact) : le dossier optimisé machine ---
  'candidature-envoyee': {
    id: 'candidature-envoyee',
    name: 'Candidature envoyée',
    cost: 1,
    category: 'espoir',
    effects: [{ kind: 'addHope', amount: 8 }],
    flavor: 'Votre candidature a bien été transmise au service concerné.',
    keywords: ['Autonome'],
    covers: ['autonome'],
  },
  'cv-optimise': {
    id: 'cv-optimise',
    name: 'CV optimisé mots-clés',
    cost: 1,
    category: 'espoir',
    effects: [{ kind: 'addHope', amount: 8 }],
    flavor: 'Vous avez recopié l’offre dans votre CV. La machine reconnaît les siens.',
    keywords: ['Autonome'],
    covers: ['polyvalent', 'maîtrise du Pack Office'],
  },
  'profil-recherche': {
    id: 'profil-recherche',
    name: 'Profil activement recherché',
    cost: 2,
    category: 'espoir',
    effects: [{ kind: 'multiplyHope', factor: 2, baseIfZero: 16 }],
    flavor: 'Un message automatique vous informe que votre profil correspond.',
    keywords: ['Autonome'],
    covers: ['bon relationnel'],
  },
  certification: {
    id: 'certification',
    name: 'Certification en ligne',
    cost: 1,
    category: 'espoir',
    effects: [{ kind: 'addHope', amount: 5 }],
    flavor: 'Suivie en une après-midi. Ajoute une ligne. Coche une case.',
    keywords: ['Autonome'],
    covers: ['anglais courant'],
  },
  portfolio: {
    id: 'portfolio',
    name: 'Portfolio en ligne',
    cost: 2,
    category: 'espoir',
    effects: [{ kind: 'multiplyHope', factor: 2, baseIfZero: 14 }],
    flavor: 'Tout votre travail, rangé, présenté, accessible. Personne ne l’ouvrira.',
    keywords: ['Autonome'],
    covers: ['force de proposition'],
  },
  'mot-cle-exact': {
    id: 'mot-cle-exact',
    name: 'Mot-clé Exact',
    cost: 1,
    category: 'utilitaire',
    effects: [{ kind: 'shieldNextBreak', reduction: 0.35 }],
    flavor: 'Passe le filtre. Ne rapporte rien. Ne promet rien. Fonctionne.',
    keywords: ['Autonome'],
    covers: ['autonome', 'polyvalent'],
  },

  // --- Bloquées par l'ATS (aucun mot-clé) : vos vraies qualités, illisibles ---
  'entretien-positif': {
    id: 'entretien-positif',
    name: "L'entretien s'est très bien passé",
    cost: 1,
    category: 'espoir',
    effects: [{ kind: 'multiplyHope', factor: 2, baseIfZero: 16 }],
    flavor: 'Impression positive rapportée après un échange oral. Aucune valeur contractuelle.',
    covers: ['souriant', 'bon relationnel'],
  },
  'poste-correspond': {
    id: 'poste-correspond',
    name: 'Le poste correspond exactement',
    cost: 2,
    category: 'espoir',
    effects: [{ kind: 'multiplyHope', factor: 3, baseIfZero: 24 }],
    flavor: "L'annonce semble écrite pour vous. C'est précisément ce qui devrait vous inquiéter.",
    covers: ['trois ans d’expérience'],
  },
  'relance-polie': {
    id: 'relance-polie',
    name: 'Relance polie',
    cost: 1,
    category: 'utilitaire',
    effects: [{ kind: 'reduceRiskThisTurn', factor: 0.6 }],
    flavor: 'Une relance courte et posée à J+10 est légitime.',
    covers: ['gestion du stress'],
  },
  'banniere-nebuleuse': {
    id: 'banniere-nebuleuse',
    name: 'Bannière « Ouvert aux opportunités »',
    cost: 0,
    category: 'espoir',
    effects: [{ kind: 'addHope', amount: 6 }],
    flavor: 'Un cercle vert autour de votre photo. Vous vous sentez déjà mieux.',
  },
  mutuelle: {
    id: 'mutuelle',
    name: "Mutuelle d'entreprise",
    cost: 1,
    category: 'espoir',
    effects: [{ kind: 'addHope', amount: 5 }],
    flavor: 'Présentée comme un avantage. Obligatoire pour tout employeur depuis 2016.',
  },
  babyfoot: {
    id: 'babyfoot',
    name: 'Babyfoot dans la salle de pause',
    cost: 0,
    category: 'espoir',
    effects: [{ kind: 'addHope', amount: 4 }],
    flavor: 'La photo de couverture de l’annonce. Personne n’y joue jamais.',
    covers: ['esprit d’équipe'],
  },

  // --- V1 : l'Acte I ---
  'transparence-assumee': {
    id: 'transparence-assumee',
    name: 'Transparence assumée',
    cost: 1,
    category: 'utilitaire',
    effects: [{ kind: 'declareGaps' }],
    flavor: 'Je ne maîtrise pas ce point. Je sais où l’apprendre.',
  },
  'contact-direct': {
    id: 'contact-direct',
    name: 'Contact direct',
    cost: 2,
    category: 'utilitaire',
    effects: [{ kind: 'bypassLayers' }],
    flavor: 'Quelqu’un vous a donné le nom de la personne qui décide vraiment.',
    covers: ['mobilité nationale'],
  },
  exclusivite: {
    id: 'exclusivite',
    name: 'Exclusivité',
    cost: 0,
    category: 'piege',
    // Le bonus doit être tentant. Le coût n'est pas un malus : c'est une
    // FERMETURE (les utilitaires quittent le run, main ET pioche).
    effects: [
      { kind: 'addHope', amount: 14 },
      { kind: 'exclusiveLock', category: 'utilitaire' },
    ],
    flavor: 'Vous acceptez d’être représenté exclusivement. Par qui ? On vous le dira après.',
    covers: ['permis B'],
  },
  'disponible-immediatement': {
    id: 'disponible-immediatement',
    name: 'Disponible immédiatement',
    cost: 1,
    category: 'piege',
    effects: [{ kind: 'addHope', amount: 12 }],
    flavor: 'Vous êtes libre tout de suite. On se demande pourquoi.',
    covers: ['disponible le week-end'],
  },
  'trou-de-cv-explique': {
    id: 'trou-de-cv-explique',
    name: 'Le trou de CV expliqué',
    cost: 1,
    category: 'utilitaire',
    effects: [{ kind: 'shieldNextBreak', reduction: 0.4 }],
    flavor: 'Vous avez préparé la phrase. Elle tient en dix secondes.',
    covers: ['gestion du stress'],
  },
  recommandation: {
    id: 'recommandation',
    name: 'Recommandation d’un ancien manager',
    cost: 2,
    category: 'espoir',
    effects: [{ kind: 'multiplyHope', factor: 2, baseIfZero: 20 }],
    flavor: 'Rare, solide, et personne ne la lira avant l’entretien.',
    covers: ['esprit d’équipe', 'bon relationnel'],
  },
};

/** Le deck de départ du profil Junior pour le slice : une de chaque, 12 cartes. */
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

/**
 * Le deck de l'Acte I (V1). Transparence assumée y est GARANTIE : c'est la
 * parade nº 1 du garde-fou noté en conception (une victoire qui dépend d'une
 * seule carte non piochée se lirait comme arbitraire). En avoir deux la rend
 * fiable sans la rendre gratuite.
 */
export const ACTE_I_DECKLIST: ReadonlyArray<readonly [string, number]> = [
  ...DECKLIST,
  ['transparence-assumee', 2],
  ['contact-direct', 1],
  ['exclusivite', 1],
  ['disponible-immediatement', 1],
  ['trou-de-cv-explique', 1],
  ['recommandation', 1],
];

/** Construit et mélange un deck. Chaque doublon reçoit son uid propre. */
export function buildDeckFrom(
  decklist: ReadonlyArray<readonly [string, number]>,
  rng: Rng,
): readonly CardInstance[] {
  const deck: CardInstance[] = [];
  let uid = 0;
  for (const [defId, count] of decklist) {
    for (let i = 0; i < count; i++) {
      deck.push({ uid: `c${uid}`, defId });
      uid += 1;
    }
  }
  return shuffle(deck, rng);
}

export function buildDeck(rng: Rng): readonly CardInstance[] {
  return buildDeckFrom(DECKLIST, rng);
}

export function buildActeIDeck(rng: Rng): readonly CardInstance[] {
  return buildDeckFrom(ACTE_I_DECKLIST, rng);
}
