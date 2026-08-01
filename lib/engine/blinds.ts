import type { Blind, Offer } from './types';

/**
 * Le blind du proto v5, conservé comme référence de calibrage.
 * Un blind n'a PAS de PV : il a une règle (computeRisk) et un seuil.
 * Sa seule prise de parole est sa ligne de mort (écran de fin).
 */
export const recruteur: Blind = {
  id: 'recruteur',
  name: 'Le Recruteur',
  kind: 'probabilistic',
  seuil: 45,
  maxTurns: 5,
  rule: 'Étudie votre dossier. Peut émettre des réserves à tout moment.',
  mechanic: 'Plus votre Espoir est haut, plus le risque de casse augmente.',
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
 * (injouable), pas affaiblie. L'ATS ne casse jamais l'Espoir : sa seule menace
 * est de te priver de tes meilleures cartes.
 */
export const ats: Blind = {
  id: 'ats',
  name: 'Le Filtre ATS',
  kind: 'word-trigger',
  seuil: 24,
  maxTurns: 4,
  requiredKeyword: 'Autonome',
  rule: 'Analyse automatique. Toute pièce hors référentiel est écartée.',
  mechanic: 'Toute carte sans le mot-clé exact est bloquée.',
  deathLineShattered: '',
  deathLineBelowSeuil: 'CANDIDATURE\nNON RETENUE',
  victoryLine: 'DOSSIER TRANSMIS\nÀ UN RECRUTEUR',
  computeRisk: () => 0,
};

/**
 * Le Ghosteur — le silence (kind 'silent-decay').
 * Pas de seuil, n'attaque jamais, ne répond jamais. L'Espoir se décompose seul,
 * d'autant plus vite qu'il est haut (The Sorrow). La seule victoire est PARTIR.
 */
export const ghosteur: Blind = {
  id: 'ghosteur',
  name: 'Le Silence',
  kind: 'silent-decay',
  seuil: 0,
  maxTurns: 8,
  rule: 'Dossier transmis. Aucune réponse à ce jour.',
  mechanic: 'Aucune réponse ne viendra. Votre Espoir se décompose chaque tour. Partir le conserve.',
  deathLineShattered: '',
  deathLineBelowSeuil: '',
  victoryLine: 'VOUS ÊTES PARTI',
  computeRisk: () => 0,
  computeDecay: (state) => {
    const rate = Math.min(0.7, 0.2 + state.hope / 150);
    return Math.floor(state.hope * (1 - rate));
  },
};

// ============================================================
// V1 — l'Acte I. Cinq blinds, cinq façons de perdre.
// ============================================================

/**
 * L'Offre Mouton à Cinq Pattes (kind 'escalating-demands').
 * Chaque tour révèle une exigence de plus, tirée au hasard, sans limite : il est
 * mathématiquement impossible de tout couvrir. On ne gagne pas en cochant les
 * cases, on gagne en NOMMANT ses lacunes (carte Transparence assumée), ce qui
 * neutralise la Liste Infinie pour le reste du combat.
 *
 * ⚠ Désjargonnage obligatoire (CLAUDE.md §3) : le pool d'exigences est
 * volontairement universel. Aucun terme technique, jamais.
 */
export const moutonCinqPattes: Blind = {
  id: 'mouton',
  name: 'Nous recherchons un profil rare',
  kind: 'escalating-demands',
  seuil: 40,
  maxTurns: 6,
  rule: 'Maîtrise de quatre domaines exigée. Poste junior.',
  mechanic:
    'Chaque tour ajoute une exigence. Une exigence que votre deck ne couvre pas ampute votre Espoir.',
  demandPool: [
    'polyvalent',
    'autonome',
    'souriant',
    'disponible le week-end',
    'trois ans d’expérience',
    'permis B',
    'anglais courant',
    'bon relationnel',
    'gestion du stress',
    'esprit d’équipe',
    'force de proposition',
    'mobilité nationale',
    'maîtrise du Pack Office',
    'sens du service client',
  ],
  deathLineShattered: 'VOTRE PROFIL EST INTÉRESSANT\nMAIS NOUS CHERCHONS QUELQU’UN\nDE PLUS POLYVALENT',
  deathLineBelowSeuil: 'VOTRE PROFIL EST INTÉRESSANT\nMAIS NOUS CHERCHONS QUELQU’UN\nDE PLUS POLYVALENT',
  victoryLine: 'FINALEMENT ON VA\nPRENDRE UN ALTERNANT',
  computeRisk: () => 0,
};

/**
 * La Poupée Russe (kind 'nested-layers').
 * Tu bats un interlocuteur, et derrière il y en a un autre, identique, qui
 * t'annonce qu'il n'est pas non plus le décideur. AUCUN PV : chaque couche
 * franchie RELÈVE le seuil, le compteur de tours ne se réinitialise pas, et la
 * récompense affichée fond (chaque intermédiaire prend sa marge).
 *
 * Option B (endurance) retenue pour l'implémentation : on PEUT aller au bout,
 * mais la récompense est devenue dérisoire. La carte Contact direct offre le
 * court-circuit sans être obligatoire (garde-fou : une victoire qui dépend
 * d'une seule carte non piochée se lit comme arbitraire).
 */
export const poupeeRusse: Blind = {
  id: 'poupee',
  name: 'L’Intermédiaire',
  kind: 'nested-layers',
  seuil: 20,
  layers: 3,
  layerSeuilStep: 18,
  rewardStart: 100,
  rewardKeptPerLayer: 0.6,
  maxTurns: 8,
  rule: 'Je transmets votre profil à mon partenaire.',
  mechanic: 'Atteindre le seuil vous transmet à l’interlocuteur suivant, qui en exige davantage.',
  deathLineShattered: 'VOTRE DOSSIER N’A PAS ÉTÉ\nTRANSMIS À L’ÉCHELON SUIVANT',
  deathLineBelowSeuil: 'VOTRE DOSSIER N’A PAS ÉTÉ\nTRANSMIS À L’ÉCHELON SUIVANT',
  victoryLine: 'LE DÉCIDEUR VOUS RECEVRA\nULTÉRIEUREMENT',
  computeRisk: () => 0,
};

/** Les badges des couches. Visuellement quasi identiques : seul le mot change. */
export const POUPEE_LAYER_LABELS: readonly string[] = [
  'Intermédiaire',
  'Second intermédiaire',
  'Partenaire de l’intermédiaire',
];

export const POUPEE_LAYER_LINES: readonly string[] = [
  'Je transmets votre profil à mon partenaire.',
  'Je transmets votre profil au client.',
  'Le client souhaite un dernier échange avec son prestataire.',
];

/**
 * Prétentions Salariales (kind 'number-first').
 * Chaque carte jouée est un chiffre annoncé, et le risque monte avec le nombre
 * de chiffres lâchés. La règle cachée : ne jamais parler en premier. Dire le
 * minimum puis se taire est le coup optimal ; le seuil est bas exprès.
 */
export const pretentionsSalariales: Blind = {
  id: 'pretentions',
  name: 'Vos prétentions ?',
  kind: 'number-first',
  seuil: 22,
  maxTurns: 5,
  rule: 'Souhaite connaître vos attentes salariales avant de se prononcer.',
  mechanic: 'Chaque carte jouée augmente le risque. Passer le tour ne coûte rien.',
  deathLineShattered: 'VOS PRÉTENTIONS SONT\nAU-DESSUS DE NOTRE FOURCHETTE',
  deathLineBelowSeuil: 'LE POSTE A ÉTÉ POURVU\nPENDANT LA NÉGOCIATION',
  victoryLine: 'VOTRE DEMANDE A ÉTÉ\nTRANSMISE À LA DIRECTION',
  // Chaque chiffre annoncé rapproche la rupture. Se taire ne coûte rien.
  computeRisk: (state) => Math.min(0.85, state.blindState.numbersAnnounced * 0.26),
};

/**
 * Le Poste Fictif (kind 'no-resolution').
 * L'offre n'a jamais été ouverte. Le système répond, poliment, automatiquement,
 * et ne résout rien. Tout l'Espoir investi ici s'évapore à la fermeture du
 * ticket. La sortie n'est PAS une défaite scriptée (il n'y en a qu'une dans le
 * jeu) : retirer sa candidature conserve l'Espoir pour la suite de la run.
 */
export const posteFictif: Blind = {
  id: 'fictif',
  name: 'Référence 4471-B',
  kind: 'no-resolution',
  seuil: 0,
  maxTurns: 6,
  rule: 'Votre candidature suit son cours. Aucune date n’est communiquée.',
  mechanic: 'Aucune décision ne sera prise. L’Espoir laissé ici sera perdu. Partir le conserve.',
  deathLineShattered: 'L’OFFRE A ÉTÉ RETIRÉE',
  deathLineBelowSeuil: 'L’OFFRE A ÉTÉ RETIRÉE',
  victoryLine: 'VOUS AVEZ RETIRÉ\nVOTRE CANDIDATURE',
  computeRisk: () => 0,
};

/**
 * Le Manager qui a Pris un Senior (kind 'scripted-loss').
 * Tout réussit. Le seuil est atteignable, le risque est nul, et la défaite est
 * écrite. L'UNIQUE boss sans sortie du jeu (CLAUDE.md §2 : pas deux, sinon le
 * jeu devient une plainte). Sa ligne est la plus humaine du jeu : on ne te dit
 * pas que tu étais mauvais, on te dit qu'il y avait mieux.
 */
export const leManager: Blind = {
  id: 'manager',
  name: 'Le Manager',
  kind: 'scripted-loss',
  seuil: 35,
  maxTurns: 5,
  rule: 'Échange cordial. Tous les signaux sont au vert.',
  // Vrai, et parfaitement inutile : c'est tout le sujet de ce boss.
  mechanic: 'Aucun risque détecté.',
  deathLineShattered: 'NOUS AVONS RETENU\nUN AUTRE PROFIL',
  deathLineBelowSeuil: 'NOUS AVONS RETENU\nUN AUTRE PROFIL',
  victoryLine: '',
  computeRisk: () => 0,
};

// --- Runs -----------------------------------------------------------------

/** La run du slice (V0.5) : le robot filtre, puis l'humain ne répond pas. */
export const SLICE_RUN: readonly Blind[] = [ats, ghosteur];

/** Tous les blinds adressables par une offre (V1). */
export const BLINDS_BY_ID: Record<string, Blind> = {
  recruteur,
  ats,
  ghosteur,
  mouton: moutonCinqPattes,
  poupee: poupeeRusse,
  pretentions: pretentionsSalariales,
  fictif: posteFictif,
  manager: leManager,
};

/**
 * L'Acte I : cinq étapes. À chaque étape, le job board propose 3 offres tirées
 * de ce pool ; l'offre choisie convoque son blind. La dernière étape est le
 * Manager, la seule défaite scriptée : on ne la choisit pas, on y arrive.
 */
export const ACTE_I_POOLS: ReadonlyArray<readonly string[]> = [
  ['ats', 'pretentions', 'fictif'],
  ['recruteur', 'mouton', 'poupee'],
  ['poupee', 'ghosteur', 'pretentions'],
  ['mouton', 'recruteur', 'fictif'],
  ['manager'],
];

/**
 * Applique le red flag de l'offre au blind : les « avantages » de l'annonce
 * SONT les modificateurs de règles (le blind de Balatro). L'offre est le niveau.
 */
export function applyOffer(blind: Blind, offer: Offer): Blind {
  const m = offer.redFlag.modifier;
  switch (m.kind) {
    case 'seuilFactor':
      return { ...blind, seuil: Math.round(blind.seuil * m.factor) };
    case 'turnsDelta':
      return { ...blind, maxTurns: Math.max(2, blind.maxTurns + m.delta) };
    case 'lockLeave':
    case 'energyDelta':
      // Appliqués à l'état initial (createInitialState), pas au blind.
      return blind;
  }
}
