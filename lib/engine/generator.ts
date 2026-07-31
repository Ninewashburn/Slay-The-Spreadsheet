import type { Offer, OfferModifier, Rng } from './types';
import { pickWord } from './words';

/**
 * Le générateur par assemblage (V1).
 *
 * Les vrais refus SONT des templates fusionnés (preuve : Le Template Non Rempli).
 * Les générer par morceaux n'est donc pas un raccourci de production : c'est le
 * sujet même. Refus = ouverture + délai + mot pivot + clôture. Offre = intitulé
 * + faux avantages (dont le vide légal) + un red flag qui porte la règle.
 *
 * Tout est tiré du Rng seedé : même seed, même job board (daily run gratuit).
 * Toutes les chaînes respectent la voix du jeu (CLAUDE.md §8) : phrases courtes,
 * administratives, aucun tiret cadratin.
 */

function pick<T>(pool: readonly T[], rng: Rng): T {
  return pool[Math.floor(rng() * pool.length)] as T;
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
];

/** Red flags canon. C'est le red flag qui porte la règle : l'offre EST le niveau. */
const RED_FLAGS: ReadonlyArray<{ label: string; modifier: OfferModifier }> = [
  { label: 'Salaire selon profil', modifier: { kind: 'seuilFactor', factor: 1.25 } },
  { label: 'Jeune équipe dynamique', modifier: { kind: 'turnsDelta', delta: -1 } },
  { label: 'Autonome', modifier: { kind: 'energyDelta', delta: -1 } },
  { label: 'Polyvalent', modifier: { kind: 'seuilFactor', factor: 1.2 } },
  { label: 'Poste évolutif', modifier: { kind: 'seuilFactor', factor: 1.15 } },
  { label: 'On est une famille', modifier: { kind: 'lockLeave' } },
  { label: 'Babyfoot dans les locaux', modifier: { kind: 'turnsDelta', delta: -1 } },
];

/**
 * La fourchette au centime près. La fausse rigueur comptable posée sur une
 * plage du simple au double : personne n'a besoin de connaître le métier pour
 * rire. Ne JAMAIS arrondir (GAME_DESIGN, Fourchette Schrödinger).
 */
function salaryRange(rng: Rng): { low: number; high: number } {
  const low = 24000 + Math.floor(rng() * 9000) + Math.round(rng() * 100) / 100;
  const high = low * (1.6 + rng() * 0.5);
  return { low: Math.round(low * 100) / 100, high: Math.round(high * 100) / 100 };
}

export function generateOffer(rng: Rng, blindId: string, index: number): Offer {
  const advantages: string[] = [];
  const pool = [...ADVANTAGES];
  for (let i = 0; i < 3 && pool.length > 0; i++) {
    const idx = Math.floor(rng() * pool.length);
    advantages.push(pool.splice(idx, 1)[0] as string);
  }
  const { low, high } = salaryRange(rng);

  return {
    id: `offer-${index}`,
    title: pick(TITLES, rng),
    contract: pick(CONTRACTS, rng),
    advantages,
    redFlag: pick(RED_FLAGS, rng),
    blindId,
    salaryLow: low,
    salaryHigh: high,
  };
}

/** Le job board : 3 offres, une par blind proposé. L'offre EST le niveau. */
export function generateJobBoard(rng: Rng, blindIds: readonly string[]): readonly Offer[] {
  return blindIds.map((id, i) => generateOffer(rng, id, i));
}

/** Formate un montant à la française, au centime près. */
export function formatSalary(amount: number): string {
  return `${amount.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
}

// --- Refus ----------------------------------------------------------------

const OPENINGS: readonly string[] = [
  'Nous vous remercions de l’intérêt que vous portez à notre entreprise.',
  'Nous avons bien reçu votre candidature.',
  'Votre candidature a retenu notre attention.',
  'Nous vous remercions du temps consacré à ce processus.',
];

const DELAYS: readonly string[] = [
  'Après étude attentive de votre dossier,',
  'À l’issue de notre processus de sélection,',
  'Après un échange avec l’équipe,',
  'Après consultation du responsable du poste,',
];

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
 * Un refus assemblé. La gravité choisit le mot pivot ; le reste est du template
 * fusionné, exactement comme les vrais.
 */
export function generateRefusal(rng: Rng, gravity: number): Refusal {
  const pivot = pickWord(gravity, rng);
  const body = [
    pick(OPENINGS, rng),
    `${pick(DELAYS, rng)} ${pivot.toLowerCase()}, ${pick(CLOSINGS, rng)}`,
    pick(SIGNOFFS, rng),
  ].join('\n\n');
  return { pivot, body };
}
