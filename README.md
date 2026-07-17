# Slay the Spreadsheet (nom interne)

Deckbuilding roguelike satirique sur la recherche d'emploi. Le deck = ton
profil. Les blinds = les étapes d'un process. L'**Espoir** est ton score — et
la seule chose par laquelle le jeu peut te blesser.

> **Commencer par lire `CLAUDE.md`** (les non-négociables), puis `ROADMAP.md`
> (la version courante : V0.5, le vertical slice). La conception complète est
> dans `docs/GAME_DESIGN.md`.

## Démarrage

```bash
npm install
npm test        # le moteur : 12 tests, dont les 3 bugs de playtest en non-régression
npm run dev     # http://localhost:3000 — l'écran de combat (parité proto v5)
```

Sur Windows, `start.bat` fait tout (install au premier lancement, serveur, navigateur).

## Structure

```
CLAUDE.md               # les règles dures (thèse, ton, architecture, DA)
ROADMAP.md              # versions scoppées — on n'implémente QUE la courante
docs/
  GAME_DESIGN.md        # la banque : blinds, cartes, écrans, journal de playtest
  proto-espoir-v5.html  # le proto validé — référence de comportement ET de style
lib/engine/             # le moteur : TypeScript pur, zéro React, RNG injecté
  types.ts              #   le contrat (Effect en data, Blind = règle + seuil)
  reducer.ts            #   LE point de décision unique (applyAction)
  effects.ts            #   le résolveur unique des effets
  cards.ts              #   les cartes du slice, en data
  blinds.ts             #   Recruteur (référence) + contrats ATS/Ghosteur
  rng.ts                #   mulberry32 + shuffle — même seed, même run
  __tests__/            #   vitest — chaque règle arrive avec son test
lib/ui/                 # côté client : store Zustand (miroir de GameState, rolls
                        #   via Rng seedé) + aperçus de cartes (via le vrai résolveur)
components/combat/      # la scène : fenêtre RH, blind incarné, offre-document,
                        #   cartes-objets (drag & drop), fil d'activité, écrans de fin
                        #   (art Corporate Memphis en SVG inline : art.tsx)
app/                    # Next 15 (App Router) — la page d'accueil EST le combat
```

## Le principe qui gouverne tout

**La mécanique est la traduction littérale d'une phrase réellement reçue.**
« Le client cherche surtout quelqu'un de polyvalent » → transforme les cartes
rares en cartes communes. La blague est la règle — jamais une vanne plaquée
dessus. Et la satire vise le processus, jamais les personnes : un recruteur
doit pouvoir rire et partager.
