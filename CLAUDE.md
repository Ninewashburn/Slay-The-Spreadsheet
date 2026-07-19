# CLAUDE.md — Slay the Spreadsheet

> Deckbuilding roguelike satirique sur la recherche d'emploi.
> Le nom « Slay the Spreadsheet » est **interne** : ne pas le publier (posts, stores,
> domaines) avant le premier build jouable. Repo **privé** jusqu'à cette étape.

Ce fichier contient les **non-négociables**. Tout ce qui est contenu, versions et
backlog vit dans `ROADMAP.md`. Toute la conception (cartes, blinds, écrans, ton)
vit dans `docs/GAME_DESIGN.md`. En cas de doute : ces trois fichiers font foi,
dans cet ordre : CLAUDE.md > ROADMAP.md > GAME_DESIGN.md.

---

## 1. La thèse (ne jamais la casser)

**L'Espoir est à la fois le score et la vulnérabilité.**

- L'Espoir n'est **jamais** des points de vie reskinnés. À Espoir 0 on est
  invulnérable — et bloqué. Le blind ne « tape » pas : il **convertit l'Espoir
  du joueur en dégâts** (le « mais » détruit ce que le joueur a lui-même construit).
- Un blind = **une règle + un seuil**, jamais une créature à PV. On ne le tue
  pas : on passe, ou on ne passe pas (modèle : les blinds de Balatro).
- Les deux boss les plus durs du jeu se gagnent **en ne jouant pas**
  (Passer, Partir). C'est l'identité de design du projet.
- Le déséquilibre est **assumé et thématique** (modèle : les trésors du Bois
  Maudit). Le marché du travail n'est pas équilibré ; un jeu « fair » sur ce
  sujet serait le seul vrai mensonge. Ne pas passer du temps à équilibrer finement.

## 2. Le ton (le garde-fou le plus important)

**La satire vise le processus, jamais les personnes.**

- Test décisif avant toute publication de contenu : **un recruteur doit pouvoir
  rire et partager**. Si non, le contenu est raté — il ferme des portes en silence.
- Tendre, pas amer (modèle : Caméra Café — chaque archétype est ridicule ET
  attachant). Le déadpan institutionnel : la blague se dit au premier degré,
  dans la langue exacte de l'entreprise, sans clin d'œil (modèle : Groland,
  Papers Please).
- **Aucune entreprise réelle, aucune école réelle, aucune personne réelle.**
  Les boss sont des archétypes (« Le Manager »), jamais des portraits.
- Le joueur incarne un **candidat faillible**, pas un génie incompris.
  L'autodérision protège.
- Un seul boss « défaite scriptée sans sortie » dans tout le jeu
  (Le Manager qui a Pris un Senior). Pas deux. Sinon le jeu devient une plainte.

## 3. La règle d'extraction (filtre qualité de tout contenu)

**Phrase réelle → mécanique littérale. Jamais l'inverse.**

- Une carte/un blind naît d'une phrase réellement reçue, traduite en règle
  sans rien ajouter (« Le client cherche quelqu'un de polyvalent » →
  transforme les rares en communes). La blague **est** la règle.
- Interdit : inventer une mécanique puis chercher une vanne à poser dessus
  (« Transformation Digitale : renomme les cartes, aucun effet » = contre-exemple).
- Les références (Dark Souls, MGS3…) sont un **étage bonus, jamais le plancher** :
  le contenu doit marcher pour quelqu'un qui n'a pas la référence.
- Cible : tout le monde, **pas les développeurs**. Docker/SQL/Git ne sont pas
  des cartes. « Malheureusement », si.

## 4. La règle d'information

**Précision du côté du joueur, brouillard du côté du système.**

- Tout ce que le joueur contrôle est **calculé et affiché** (aperçu « 16 → 32 »
  sur chaque carte, coche verte quand le seuil est franchissable). Zéro math mentale.
- Tout ce que le joueur ne contrôle pas reste **vague** : le risque n'affiche
  jamais un pourcentage, seulement des phrases (« Vous y croyez peut-être un
  peu trop »). Tu connais ton dossier ; tu ne connais jamais tes chances.

## 5. L'architecture (contraintes techniques dures)

- **`lib/engine/` est du TypeScript pur** : zéro import React/Next/Zustand.
  Fonctions pures, état immuable, testable sans UI.
- **Les effets sont de la data** (`Effect` union), interprétés par un seul
  résolveur (`effects.ts`). Jamais de logique de carte codée en dur ailleurs.
- **Un seul point de décision d'état** : `applyAction` (reducer). Aucun flag
  d'état hors du `GameState`. (Trois bugs du proto venaient d'états baladeurs —
  voir le journal de playtest dans GAME_DESIGN.md ; ils sont couverts par des
  tests de non-régression nommés.)
- **Le hasard est injecté** : `roll` en paramètre d'action, `Rng` seedé
  (mulberry32). Même seed → même run. C'est ce qui rend daily runs,
  replays et tests gratuits. Ne jamais appeler `Math.random()` dans le moteur.
- L'UI (React/Zustand/Framer Motion) **lit** l'état et **fournit** les rolls.
  Elle ne décide jamais d'une règle.
- Toute nouvelle règle du moteur arrive **avec son test**. TS strict,
  `noUncheckedIndexedAccess`, zéro `any`.

## 6. La direction artistique

**Le jeu ressemble à ce qu'il parodie : un logiciel RH.**

- SaaS corporate : fond clair, coins arrondis, bleus doux, pastilles, la joie
  stérile des dashboards. Style d'illustration cible : Corporate Memphis.
- **Interdit** : fantasy, plateau de jeu, ornements Hearthstone. Le jeu ne doit
  jamais « avouer être un jeu » visuellement.
- **Corporate ne veut pas dire terne.** Cible = SaaS maîtrisé (Linear, Stripe,
  Notion), pas SaaS pauvre : couleur affirmée, hiérarchie nette, densité
  satisfaisante, ombres légères, typo affirmée sur les boutons. Le piège
  symétrique de la fantasy, c'est le « morpion sur une grille Word » — gris et
  vide. Les tokens du proto v5 ne doivent jamais être aplatis.
- Le compteur d'Espoir garde sa **palette d'états** : bleu → doré → corail selon
  le niveau. Jamais noir plat.
- **Lisibilité façon UNO** : code couleur par TYPE de carte, lisible d'un coup
  d'œil (bleu = gonfle l'Espoir, vert = utilitaire, 3e teinte = piège /
  malédiction). C'est la seule chose à voler aux jeux de cartes grand public :
  la lecture instantanée par la couleur, jamais le décor.
- **Pas de mascotte** façon Duolingo (ça avoue « jeu »). Mais voler la
  *sensation* Duolingo : le micro-feedback (bump, son, transition ~200 ms) qui
  rend addictive une tâche administrative — le compteur d'Espoir le fait déjà.
  La seule chaleur « personnage » autorisée a une adresse unique : le Recruteur
  LinkedIn (PNJ récurrent, GAME_DESIGN §11), avatar générique, jamais un hibou
  attachant.
- Le juice est du **motion design d'interface** (Framer Motion) : un chiffre qui
  grimpe, un mot qui tombe, une carte qui glisse. **Pas de Three.js** — rien ici
  ne demande une caméra.
- Référence de comportement ET de style : `docs/proto-espoir-v5.html`
  (tokens CSS repris dans `app/globals.css`).
- Audio (plus tard) : musique corporate enjouée pendant que le jeu te détruit —
  jamais de musique épique.

## 7. Discipline de périmètre

- **Vertical slice ou rien** (V0.5 dans ROADMAP.md). Ne rien implémenter hors
  de la version courante. Les bonnes idées vont dans GAME_DESIGN.md, pas dans le code.
- Contexte du créateur : recherche d'emploi active + VAE (échéance ferme 31/08/2026).
  Ce projet est une vitrine technique, pas un produit à monétiser. Chaque session
  doit laisser le repo dans un état montrable.
- FR d'abord. L'anglais sera **refait, pas traduit** (chaque langue a sa banque
  de phrases réelles) — plus tard.

## 8. Voix du texte in-game (aucun tic IA)

Tout texte affiché à l'écran (cartes, lignes de mort, flavor d'offres,
messages de log, tooltips) suit ces règles dures :

- **Aucun tiret cadratin (—)** en usage de ponctuation/rupture stylistique
  (ex: "un débuff — et pas des moindres"). Reformuler avec un point, une
  virgule, ou deux phrases courtes.
- **Aucun artefact Markdown** dans une string affichée : pas de `---`,
  pas de `**gras**`, pas de listes à puces `- `. Si une mise en forme est
  nécessaire, elle passe par du HTML/CSS réel, jamais par du Markdown brut
  rendu tel quel.
- **Aucune formule d'IA générique** : "En somme", "Il convient de noter",
  "N'hésitez pas à", "Voici", triples adjectifs accolés ("un système robuste,
  performant et intuitif"). Le ton du jeu est administratif et précis, pas
  un narrateur qui commente.
- Phrases courtes, sujet-verbe-complément. Le modèle stylistique reste les
  vraies phrases RH extraites (§3) : sèches, polies, jamais ornées.

**Exception explicite** : les mots du système d'intent (Cependant, Toutefois,
Malheureusement, Nonobstant…) restent inchangés — ce ne sont pas des tics
d'IA, c'est le cœur mécanique du jeu (§4). Cette règle interdit leur usage
comme connecteur narratif *ailleurs*, pas leur fonction de mot pivot.

Cette règle ne s'applique PAS aux fichiers .md du repo (CLAUDE.md, ROADMAP.md,
GAME_DESIGN.md) : documentation technique, pas texte in-game.
