# ROADMAP — Slay the Spreadsheet

> Règle : on n'implémente **que** la version courante. Les idées hors scope
> vont dans `docs/GAME_DESIGN.md` (sections « parqué »), jamais dans le code.
> État actuel : **V1 (Acte I) LIVRÉE** — job board, générateur par assemblage,
> 5 blinds, système des mots, relique et succès. Moteur pur : 64 tests.
> Prochaine version : V1.5 (profils + blinds vécus). Tout le calibrage de la V1
> (seuils, couches, pénalités) attend le playtest.

---

## V0.5 — Le vertical slice (version courante)

**Définition de fini : une run complète ATS → Ghosteur, jouable sur téléphone,
à qualité finale.** Pas 60 cartes bâclées — 12 cartes finies, 2 blinds finis,
3 écrans de fin finis.

### 1. UI de combat branchée sur `lib/engine` (première tâche) — ✅ livrée
- [x] Écran de combat portrait, une main (zone du pouce), reprenant
      `docs/proto-espoir-v5.html` : compteur d'Espoir central (bleu → doré →
      corail), pastille seuil « X / 45 exigés à la fin », main de 3 cartes avec
      aperçus calculés (« 16 → 32 », coche verte si seuil franchissable),
      Passer / Terminer le tour. (`components/combat/`)
- [x] Store Zustand = un miroir de `GameState` + dispatch vers `applyAction`
      (l'UI fournit les rolls via un Rng seedé par run). (`lib/ui/combatStore.ts`)
- [x] Animations Framer Motion : bump du compteur, mot qui tombe
      (« Cependant… »), shatter + shake à la casse.
- [x] Les 3 écrans de fin du proto : shattered (rouge/noir, Georgia),
      belowSeuil (« NOUS AVONS REÇU DE TRÈS NOMBREUSES CANDIDATURES »),
      passive (gris plat, sans-serif, sans solennité).
- [x] Passage « mise en scène » (qualité finale du slice) : décor de bureau
      (SVG Corporate Memphis faits main : plante, café, formes), blind incarné
      (avatar sans visage + règle en langage d'entreprise), l'offre comme
      document posé sur le bureau, log en fil de notifications (desktop),
      cartes-objets (flavor visible, glyphe, drag & drop vers le compteur),
      compteur géant, pips d'énergie, CTA qui pulse, tampon de défaite.
      La peau reste 100 % logiciel RH (CLAUDE.md §6) ; le toucher vient
      des jeux de cartes, jamais leur décor.

### 2. Blind ATS (`word-trigger`) — le boss tutoriel — ✅ livrée
- [x] Étendre `CardDef` : `keywords?: readonly string[]`.
- [x] L'offre affiche le mot-clé exigé ; toute carte sans le mot est
      **bloquée** (grisée, cadenas, injouable), pas affaiblie. Match EXACT
      (« Angular » ≠ « AngularJS »). Garde `isBlocked`/`canPlay` dans le reducer.
- [x] Écran de mort : « CANDIDATURE NON RETENUE » en **monospace** (la voix
      froide de la machine, contre la Georgia du refus humain).
- [x] Tests : carte bloquée = injouable (état inchangé) ; le mot exact débloque ;
      « AngularJS » ne satisfait pas « Angular » ; hors word-trigger, rien n'est bloqué.

### 3. Blind Ghosteur (`silent-decay`) — ✅ livrée
- [x] Pas de seuil. N'attaque jamais (`computeRisk` = 0). L'Espoir se décompose
      chaque tour via `computeDecay`, d'autant plus vite qu'il est haut (The Sorrow).
- [x] Action `LEAVE` (« Partir ») : la seule victoire, conserve l'Espoir.
      Bouton corail proéminent qui pulse.
- [x] Écran de mort : **aucun**. Fondu au noir silencieux, retour à l'accueil,
      zéro texte. Le contraste avec l'ATS qui parle est la caractérisation.
- [x] Tests : la décomposition scale avec l'Espoir ; LEAVE conserve l'état ;
      le silence ne casse jamais ; décomposition jusqu'au bout = fin sans ligne de mort.

### 4. La run — ✅ livrée
- [x] Enchaînement ATS → Ghosteur : victoire du 1er blind → « Continuer »
      (jamais « rejouer »). L'Espoir gagné est **reporté** sur le suivant
      (`startingHope`) : on arrive plein d'espoir chez le Ghosteur, et il fond.
- [x] 12 cartes distinctes (`lib/engine/cards.ts`) : 6 passent l'ATS (portent
      « Autonome »), 6 sont bloquées (les vraies qualités, illisibles par la machine).
- [x] Écran d'accueil sobre (`HomeScreen`, logo texte, « Postuler »).
- [x] PWA installable (`app/manifest.ts` + `public/icon.svg` + theme-color),
      app 100 % cliente (toutes routes statiques → prête pour Capacitor V2).

---

## V1 — L'Acte I complet — ✅ livrée
- [x] Le job board comme carte de run : 3 offres générées par étape, l'offre EST
      le niveau, son red flag porte le modificateur de règles (`applyOffer` :
      seuil ×, tours ±, Énergie −, ou verrouillage de Partir). 5 étapes.
      (`components/combat/JobBoard.tsx`)
- [x] Générateur **par assemblage** (`lib/engine/generator.ts`) : offre =
      intitulé + avantages (dont vide légal) + red flag + fourchette au centime
      près ; refus = ouverture + délai + mot pivot + clôture. Même seed, même
      job board. Un test vérifie qu'aucun texte généré ne viole la voix (§8).
- [x] Blinds (`lib/engine/blinds.ts`), un `BlindKind` par famille de règle :
      Prétentions Salariales (`number-first` : chaque carte est un chiffre
      annoncé, se taire ne coûte rien), Le Poste Fictif (`no-resolution` :
      l'Espoir investi s'évapore, partir le conserve), Mouton à Cinq Pattes
      (`escalating-demands` : la Liste Infinie, neutralisée par Transparence
      assumée), La Poupée Russe (`nested-layers` : zéro PV, le seuil monte, la
      récompense fond, les tours ne se réinitialisent pas), Le Manager
      (`scripted-loss` : l'unique défaite sans sortie du jeu).
- [x] Carte Exclusivité : son coût est une **fermeture** (retire du run toutes
      les cartes utilitaires, main, pioche ET défausse). Plus Transparence
      assumée (×2, garantie : garde-fou anti-arbitraire) et Contact direct.
- [x] Le système des mots (`lib/engine/words.ts`) : 12 mots, échelle de gravité,
      le mot pivot est choisi par le MOTEUR selon l'écart Espoir/seuil, puis
      tombe à l'écran avant la phrase.
- [x] Relique « Expérience du candidat » (`lib/engine/meta.ts`) : le mail de
      refus s'écrit lettre par lettre et est imblocable la première fois ;
      ensuite la relique donne le droit de le fermer aussitôt.
- [x] Succès cachés (8), dont « Je savais » (fermer le refus avant d'avoir lu le
      mot pivot), « Culture Fit », « Jamais en premier », « Déjà engagé ».

**Ouvert (playtest)** : tout le calibrage V1 (seuils, couches, pénalité
d'exigence à 25 %, décroissance de récompense). Les lignes de mort du Poste
Fictif, de la Poupée Russe et des Prétentions Salariales sont des propositions,
pas des extractions : à remplacer par de vraies phrases reçues.

## V1.5 — Les profils et les blinds vécus
- Profils = deck + reliques de départ (jamais des drops) : **Junior** (beaucoup
  d'Espoir, peu de mots-clés), **Senior** (passe l'ATS, traîne « Surqualifié »,
  doit GÉNÉRER de l'Espoir — le verbe inverse), **Reconverti** (Espoir légitime,
  lu comme un trou).
- Blinds issus du vécu (specs complètes dans GAME_DESIGN.md §Blinds vécus) :
  Le Gel Budgétaire, Le Relais, La Mutation Interne, Le Guichet Anonyme,
  L'Entretien Différé, Le Marathon, Le Doute.
- Audio : musique corporate, ding de notification (créé, pas Outlook).

## V2 — Persistance et mobile
- Supabase : sauvegardes, cartes débloquées, leaderboard du daily run
  (même seed pour tous — gratuit grâce au RNG déterministe).
- Capacitor : builds Android/iOS.
- EN : banque de phrases **refaite** par des locaux, pas traduite.

## V3+ — Extensions
- Duel asynchrone : ton deck contre le snapshot d'un autre profil, résolu par
  le moteur ; le gagnant désigné par « culture fit ».
- Entretien de groupe (群面) : mode de bluff à plusieurs candidats simulés
  (compétition directe), même famille que le duel async — un mode, pas un blind.
  Spec dans GAME_DESIGN.md §14 (parqué).
- Ascensions (modificateurs de règles sur moteur composable).
- Actes II+ (ESN, négo TJM) — et seulement là : Cooptation (saute l'ATS,
  jamais la fin), L'Ancien de la Promo (saute l'Acte I entier).

## Parqué explicitement (ne pas ouvrir)
- PvP temps réel (équilibrage, netcode, matchmaking : un autre jeu).
- Actes III-IV « avoir le job » (réunions, N+3) : un autre jeu que « le chercher ».
- Toute carte « victoire à 100 % » : n'existera jamais (casse le genre).
