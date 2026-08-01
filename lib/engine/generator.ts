import type { Offer, OfferModifier, Rng } from './types';
import { pickIntent } from './words';

/**
 * Le générateur par assemblage (V1).
 *
 * Les vrais refus SONT des templates fusionnés (preuve : Le Template Non Rempli).
 * Les générer par morceaux n'est donc pas un raccourci de production : c'est le
 * sujet même. Refus = ouverture + phrase pivot + clôture. Offre = intitulé +
 * faux avantages (dont le vide légal) + un red flag qui porte la règle.
 *
 * Tout est tiré du Rng seedé : même seed, même job board (daily run gratuit).
 * Toutes les chaînes respectent la voix du jeu (CLAUDE.md §8) : phrases courtes,
 * administratives, aucun tiret cadratin.
 */

function pick<T>(pool: readonly T[], rng: Rng): T {
  return pool[Math.floor(rng() * pool.length)] as T;
}

/** Tire n éléments distincts. Sert à ne jamais répéter un red flag sur un board. */
function sample<T>(pool: readonly T[], n: number, rng: Rng): T[] {
  const rest = [...pool];
  const out: T[] = [];
  for (let i = 0; i < n && rest.length > 0; i++) {
    out.push(rest.splice(Math.floor(rng() * rest.length), 1)[0] as T);
  }
  return out;
}

// --- Offres ---------------------------------------------------------------

/** Intitulés volontairement universels (CLAUDE.md §3 : la cible est tout le monde). */
const TITLES: readonly string[] = [
  'Chargé de mission (H/F)',
  'Assistant polyvalent (H/F)',
  'Conseiller clientèle (H/F)',
  'Gestionnaire de dossiers (H/F)',
  'Coordinateur (H/F)',
  'Technicien support (H/F)',
  'Employé administratif (H/F)',
];

const CONTRACTS: readonly string[] = [
  'CDI. Démarrage dès que possible.',
  'CDI après période d’essai renouvelable.',
  'CDD de 6 mois, évolutif.',
  'CDI. Poste à pourvoir immédiatement.',
];

/**
 * Les « avantages ». Certains sont du vide légal : le jeu ne fait que citer la
 * loi et laisser le joueur constater. Aucun commentaire, aucun clin d'œil.
 */
const ADVANTAGES: readonly string[] = [
  'Mutuelle d’entreprise.',
  'Remboursement des transports à 50 %.',
  'Congés payés.',
  'Environnement dynamique.',
  'Équipe à taille humaine.',
  'Fortes perspectives d’évolution.',
  'Locaux récents et lumineux.',
  'Café à volonté.',
  'Tickets restaurant.',
  'Esprit collaboratif.',
  'Séminaire annuel.',
  'Management de proximité.',
];

/**
 * Red flags canon, groupés par FAMILLE de contrainte. C'est le red flag qui
 * porte la règle : l'offre EST le niveau. Un board tire une famille différente
 * par offre, sinon les trois portes sont identiques et il n'y a rien à arbitrer.
 */
interface RedFlagDef {
  readonly label: string;
  readonly modifier: OfferModifier;
  /** Ce que le joueur paie, en clair. Plus c'est lourd, mieux c'est payé. */
  readonly severity: 1 | 2 | 3;
}

const RED_FLAG_FAMILIES: ReadonlyArray<readonly RedFlagDef[]> = [
  [
    { label: 'Salaire selon profil', modifier: { kind: 'seuilFactor', factor: 1.25 }, severity: 2 },
    { label: 'Polyvalent', modifier: { kind: 'seuilFactor', factor: 1.2 }, severity: 2 },
    { label: 'Poste évolutif', modifier: { kind: 'seuilFactor', factor: 1.15 }, severity: 1 },
  ],
  [
    {
      label: 'Jeune équipe dynamique',
      modifier: { kind: 'turnsDelta', delta: -1 },
      severity: 2,
    },
    { label: 'Babyfoot dans les locaux', modifier: { kind: 'turnsDelta', delta: -1 }, severity: 1 },
    { label: 'Process de recrutement court', modifier: { kind: 'turnsDelta', delta: -2 }, severity: 3 },
  ],
  [
    { label: 'Autonome', modifier: { kind: 'energyDelta', delta: -1 }, severity: 2 },
    { label: 'Travail en autonomie complète', modifier: { kind: 'energyDelta', delta: -1 }, severity: 2 },
  ],
  [{ label: 'On est une famille', modifier: { kind: 'lockLeave' }, severity: 3 }],
];

/**
 * La fourchette au centime près. La fausse rigueur comptable posée sur une plage
 * du simple au double : personne n'a besoin de connaître le métier pour rire.
 * Ne JAMAIS arrondir (GAME_DESIGN, Fourchette Schrödinger). Plus le red flag est
 * lourd, mieux le poste est payé : c'est ce qui fait l'arbitrage.
 */
function salaryRange(rng: Rng, severity: number): { low: number; high: number } {
  const base = 24000 + severity * 3000 + Math.floor(rng() * 6000);
  const low = base + Math.round(rng() * 10000) / 100;
  const high = low * (1.35 + severity * 0.22 + rng() * 0.3);
  return { low: Math.round(low * 100) / 100, high: Math.round(high * 100) / 100 };
}

function buildOffer(rng: Rng, blindId: string, index: number, flag: RedFlagDef, advantages: string[]): Offer {
  const { low, high } = salaryRange(rng, flag.severity);
  return {
    id: `offer-${index}`,
    title: pick(TITLES, rng),
    contract: pick(CONTRACTS, rng),
    advantages,
    redFlag: { label: flag.label, modifier: flag.modifier },
    blindId,
    salaryLow: low,
    salaryHigh: high,
  };
}

export function generateOffer(rng: Rng, blindId: string, index: number): Offer {
  const family = pick(RED_FLAG_FAMILIES, rng);
  return buildOffer(rng, blindId, index, pick(family, rng), sample(ADVANTAGES, 3, rng));
}

/**
 * Le job board : une offre par blind proposé, et surtout TROIS ARBITRAGES
 * DISTINCTS. Chaque offre tire sa contrainte dans une famille différente (seuil
 * relevé / temps raccourci / Énergie amputée / sortie verrouillée) et ses
 * avantages dans un pool sans doublon. Sans ça, ce sont trois portes identiques
 * et le job board ne propose aucun choix (constat de playtest).
 */
export function generateJobBoard(rng: Rng, blindIds: readonly string[]): readonly Offer[] {
  const families = sample(RED_FLAG_FAMILIES, blindIds.length, rng);
  const advantagePool = [...ADVANTAGES];

  return blindIds.map((id, i) => {
    const family = families[i] ?? pick(RED_FLAG_FAMILIES, rng);
    const flag = pick(family, rng);
    // Avantages distincts d'une offre à l'autre : elles ne doivent pas se
    // ressembler, sinon il n'y a rien à lire entre les lignes.
    const advantages: string[] = [];
    for (let k = 0; k < 3 && advantagePool.length > 0; k++) {
      advantages.push(advantagePool.splice(Math.floor(rng() * advantagePool.length), 1)[0] as string);
    }
    return buildOffer(rng, id, i, flag, advantages);
  });
}

/** Formate un montant à la française, au centime près. */
export function formatSalary(amount: number): string {
  return `${amount.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
}

/** La contrainte de l'offre, dite en clair. Le joueur doit pouvoir arbitrer. */
export function modifierLabel(modifier: OfferModifier): string {
  switch (modifier.kind) {
    case 'seuilFactor':
      return 'Espoir exigé plus élevé';
    case 'turnsDelta':
      return `${Math.abs(modifier.delta)} tour${Math.abs(modifier.delta) > 1 ? 's' : ''} de moins`;
    case 'energyDelta':
      return 'Une Énergie de moins par tour';
    case 'lockLeave':
      return 'Vous ne pourrez pas partir';
  }
}

// --- Refus ----------------------------------------------------------------

const OPENINGS: readonly string[] = [
  'Nous vous remercions de l’intérêt que vous portez à notre entreprise.',
  'Nous avons bien reçu votre candidature et l’avons étudiée avec attention.',
  'Votre candidature a retenu notre attention.',
  'Nous vous remercions du temps consacré à ce processus.',
  'Votre dossier a été examiné par l’équipe en charge du recrutement.',
];

/** Clôtures : des propositions, complétées par le gabarit du mot pivot. */
const CLOSINGS: readonly string[] = [
  'nous ne donnerons pas suite à votre candidature.',
  'nous avons retenu un autre profil.',
  'votre profil ne correspond pas tout à fait au poste.',
  'nous avons besoin de plus d’expérience sur ce poste.',
  'nous poursuivons nos recherches.',
];

const SIGNOFFS: readonly string[] = [
  'Nous conservons votre dossier pendant deux ans.',
  'Nous vous souhaitons une bonne continuation dans vos recherches.',
  'Nous ne manquerons pas de revenir vers vous si un poste se libère.',
  'Ce message est automatique. Merci de ne pas y répondre.',
];

export interface Refusal {
  /** Le mot pivot, affiché SEUL avant la phrase. Le joueur averti sait déjà. */
  readonly pivot: string;
  /** Le mail complet, mot pivot inclus. */
  readonly body: string;
}

/**
 * Un refus assemblé. La gravité choisit le mot pivot, et c'est LE MOT qui décide
 * de la syntaxe de sa phrase : « Cependant, ... » mais « Bien que votre parcours
 * soit solide, ... ». Aucun refus agrammatical ne peut sortir d'ici.
 */
export function generateRefusal(rng: Rng, gravity: number): Refusal {
  const intent = pickIntent(gravity, rng);
  const body = [
    pick(OPENINGS, rng),
    intent.render(pick(CLOSINGS, rng)),
    pick(SIGNOFFS, rng),
  ].join('\n\n');
  return { pivot: intent.word, body };
}
