import type { Blind } from './types';

/**
 * Le blind du proto v5, conservé comme référence de calibrage.
 * Un blind n'a PAS de PV : il a une règle (computeRisk) et un seuil.
 * Sa seule prise de parole est sa ligne de mort (écran de fin).
 */
export const recruteur: Blind = {
  id: 'recruteur',
  name: 'Recruteur',
  kind: 'probabilistic',
  seuil: 45,
  maxTurns: 5,
  deathLineShattered: 'NOUS AVONS RETENU\nUN AUTRE PROFIL',
  deathLineBelowSeuil: 'NOUS AVONS REÇU\nDE TRÈS NOMBREUSES\nCANDIDATURES',
  victoryLine: 'ENTRETIEN CONFIRMÉ',
  computeRisk: (state) => Math.min(0.85, state.hope / 130),
};

// ============================================================
// V0.5 — les deux blinds du slice.
// ============================================================

/**
 * L'ATS — le boss tutoriel (kind 'word-trigger').
 * L'offre exige un mot exact ; toute carte qui ne le porte pas est BLOQUÉE
 * (injouable), pas affaiblie (« Angular » ≠ « AngularJS »). Le blocage vit
 * dans le reducer (isBlocked). L'ATS ne casse jamais l'Espoir : sa seule
 * menace est de te priver de tes meilleures cartes. On perd en n'atteignant
 * pas le seuil — la machine classe le dossier, froidement.
 */
export const ats: Blind = {
  id: 'ats',
  name: 'Le Filtre ATS',
  kind: 'word-trigger',
  seuil: 24,
  maxTurns: 4,
  requiredKeyword: 'Autonome',
  deathLineShattered: '', // l'ATS ne casse pas : jamais atteint
  deathLineBelowSeuil: 'CANDIDATURE\nNON RETENUE',
  victoryLine: 'DOSSIER TRANSMIS\nÀ UN RECRUTEUR',
  computeRisk: () => 0,
};

/**
 * Le Ghosteur — le silence (kind 'silent-decay').
 * Pas de seuil, n'attaque jamais, ne répond jamais. L'Espoir se décompose seul
 * chaque tour, d'autant plus vite qu'il est haut (The Sorrow : le combat dure
 * aussi longtemps que ton Espoir). La seule victoire est PARTIR (action LEAVE) :
 * partir tôt garde plus d'Espoir pour la suite. Écran de mort : AUCUN.
 */
export const ghosteur: Blind = {
  id: 'ghosteur',
  name: 'Le Silence',
  kind: 'silent-decay',
  seuil: 0,
  maxTurns: 8,
  deathLineShattered: '',
  deathLineBelowSeuil: '',
  victoryLine: 'VOUS ÊTES PARTI',
  computeRisk: () => 0,
  // Fraction fondue croissante avec l'Espoir : plus tu y crois, plus vite ça s'efface.
  computeDecay: (state) => {
    const rate = Math.min(0.7, 0.2 + state.hope / 150);
    return Math.floor(state.hope * (1 - rate));
  },
};

/**
 * La run du slice : l'ATS (le robot te filtre), puis le Silence (l'humain ne
 * répond pas). Passer le premier ne mène qu'au second. L'Espoir gagné à l'ATS
 * est reporté chez le Ghosteur — on arrive plein d'espoir, et il fond.
 */
export const SLICE_RUN: readonly Blind[] = [ats, ghosteur];
