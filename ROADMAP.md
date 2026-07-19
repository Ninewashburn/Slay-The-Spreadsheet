# ROADMAP — Slay the Spreadsheet

> Règle : on n'implémente **que** la version courante. Les idées hors scope
> vont dans `docs/GAME_DESIGN.md` (sections « parqué »), jamais dans le code.
> État actuel : **V0.5 tâche 1 livrée** — l'UI de combat (parité proto v5) est
> branchée sur `lib/engine` : store Zustand miroir, rolls via Rng seedé,
> animations Framer Motion, 3 écrans de fin. Prochaine tâche : le blind ATS.

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

### 2. Blind ATS (`word-trigger`) — le boss tutoriel
- [ ] Étendre `CardDef` : `keywords?: readonly string[]`.
- [ ] L'offre affiche 1-2 mots-clés exigés ; toute carte sans le mot est
      **bloquée** (grisée, injouable), pas affaiblie. « Angular » ≠ « AngularJS ».
- [ ] Écran de mort : « CANDIDATURE NON RETENUE » — froid, automatique, machine.
- [ ] Tests : carte bloquée ≠ jouable ; le mot exact débloque.

### 3. Blind Ghosteur (`silent-decay`)
- [ ] Pas de seuil à atteindre. N'attaque jamais. L'Espoir se décompose chaque
      tour, d'autant plus vite qu'il est haut (le combat dure aussi longtemps
      que ton Espoir — The Sorrow).
- [ ] Nouvelle action `LEAVE` (« Partir ») : la seule victoire. Partir tôt =
      garder son Espoir pour la suite.
- [ ] Écran de mort : **aucun**. Retour au menu, silence. (Le contraste avec
      l'ATS qui parle est toute la caractérisation — ne mettre AUCUN texte.)
- [ ] Tests : la décomposition scale avec l'Espoir ; LEAVE conserve l'état.

### 4. La run
- [ ] Enchaînement ATS → Ghosteur (l'écran de victoire d'un blind mène au
      suivant : « Continuer », pas « rejouer »).
- [ ] 12 cartes du slice (les 5 défs actuelles + à compléter depuis
      GAME_DESIGN.md §Cartes, catégorie slice).
- [ ] Écran d'accueil sobre (logo texte, Jouer) — on est dans un outil, pas un jeu.
- [ ] PWA installable (manifest + icônes), test réel sur téléphone.

---

## V1 — L'Acte I complet
- Le job board comme carte de run : 3 offres générées, l'offre EST le niveau,
  ses « avantages » sont les règles, red flags à lire entre les lignes.
- Générateur d'offres et de refus **par assemblage** (formule d'ouverture +
  mot pivot + clôture) — contenu infini, zéro écriture à la pièce.
- Blinds : Prétentions Salariales (passer = coup optimal), Le Poste Fictif,
  Le Manager qui a Pris un Senior (l'unique défaite scriptée du jeu).
- Le système des mots comme intents visibles (12 mots, échelle de gravité).
- Relique « Expérience du candidat » : le mail de refus intégral est imblocable
  UNE fois (run 1), puis la relique le saute à jamais. C'est la méta-progression.
- Succès cachés (« Je savais », « Lu en diagonale », « Culture Fit »…).

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
