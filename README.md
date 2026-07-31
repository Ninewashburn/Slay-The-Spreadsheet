# Slay the Spreadsheet (nom interne)

Deckbuilding roguelike satirique sur la recherche d'emploi. Le deck = ton
profil. Les blinds = les étapes d'un process. L'**Espoir** est ton score — et
la seule chose par laquelle le jeu peut te blesser.

> **Commencer par lire `CLAUDE.md`** (les non-négociables), puis `ROADMAP.md`.
> La **V1 (Acte I) est livrée** : job board, 5 blinds, générateur de contenu,
> méta-progression. La conception complète est dans `docs/GAME_DESIGN.md`.

## Démarrage

```bash
npm install
npm test        # le moteur : 56 tests, dont les 3 bugs de playtest en non-régression
npm run dev     # http://localhost:3000 — l'Acte I : « Postuler » → job board → 5 étapes
```

Sur Windows, `start.bat` fait tout (install au premier lancement, serveur, navigateur).

## La run (V1)

Cinq étapes. À chacune, un **job board** propose des offres générées : l'offre EST
le niveau, et son red flag (« Polyvalent », « On est une famille ») est le
modificateur de règles. Les blinds ne se battent pas de la même façon :

| Blind | Sa règle | Comment on s'en sort |
|---|---|---|
| Le Filtre ATS | Bloque toute carte sans son mot exact | Jouer les cartes optimisées machine |
| Le Silence | Ne répond jamais, l'Espoir se décompose | **Partir** |
| Nous recherchons un profil rare | Une exigence de plus chaque tour, sans limite | **Nommer ses lacunes** |
| L'Intermédiaire | Chaque couche franchie relève le seuil | L'endurance, ou un contact direct |
| Vos prétentions ? | Chaque carte jouée est un chiffre annoncé | **Se taire** |
| Référence 4471-B | Rien ne se résout jamais | Retirer sa candidature |
| Le Manager | Tout réussit | **Rien.** L'unique défaite scriptée du jeu. |

L'Espoir gagné est reporté d'une étape à l'autre. Perdre affiche un mail de refus
assemblé, écrit lettre par lettre : imblocable la première fois, puis la relique
« Expérience du candidat » te rend ton temps.

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
  cards.ts              #   les cartes, en data (keywords ATS, catégories, covers)
  blinds.ts             #   les 8 blinds + les pools de l'Acte I + applyOffer
  words.ts              #   les 12 mots pivots et leur échelle de gravité
  generator.ts          #   offres et refus par assemblage (seedés)
  meta.ts               #   relique « Expérience du candidat » + succès
  rng.ts                #   mulberry32 + shuffle — même seed, même run
  __tests__/            #   vitest — chaque règle arrive avec son test
lib/ui/                 # côté client : store Zustand (miroir + orchestration de
                        #   la run) + aperçus de cartes (via le vrai résolveur)
components/combat/      # la scène : accueil, job board, fenêtre RH, blind incarné,
                        #   offre-document, cartes-objets (drag & drop, blocage ATS),
                        #   mail de refus, succès, écrans de fin (art SVG : art.tsx)
app/                    # Next 15 : la run (page), manifest PWA, icône
```

## Le principe qui gouverne tout

**La mécanique est la traduction littérale d'une phrase réellement reçue.**
« Le client cherche surtout quelqu'un de polyvalent » → transforme les cartes
rares en cartes communes. La blague est la règle — jamais une vanne plaquée
dessus. Et la satire vise le processus, jamais les personnes : un recruteur
doit pouvoir rire et partager.
