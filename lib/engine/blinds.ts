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
// V0.5 — les deux blinds du slice, à implémenter (voir ROADMAP.md).
// Leurs contrats sont posés ici pour que le système de types les
// accueille sans changer une ligne du reducer.
//
// ATS (kind 'word-trigger') :
//   - L'offre exige des mots-clés exacts. Toute carte sans le mot est
//     BLOQUÉE (injouable), pas affaiblie. « Angular » ≠ « AngularJS ».
//   - Boss tutoriel : on apprend la règle en la subissant.
//   - Écran de mort : « CANDIDATURE NON RETENUE » — froid, automatique.
//   - Nécessite d'étendre CardDef (keywords) et le reducer (canPlay).
//
// Ghosteur (kind 'silent-decay') :
//   - Pas de seuil à atteindre. N'attaque jamais. Ne répond jamais.
//   - L'Espoir se décompose chaque tour, d'autant plus vite qu'il est
//     haut (le combat dure aussi longtemps que ton Espoir — The Sorrow).
//   - La seule victoire : PARTIR (nouvelle action). Partir tôt = garder
//     son Espoir pour la suite de la run.
//   - Écran de mort : AUCUN. Retour au menu, silence. Le contraste avec
//     l'ATS qui parle est toute la caractérisation.
// ============================================================
