# GAME DESIGN — Slay the Spreadsheet

> La banque de conception consolidée. Les règles dures sont dans `CLAUDE.md`,
> le séquencement dans `ROADMAP.md`. Ici : le quoi et le pourquoi.

---

## 1. La thèse

Le deck = le profil du candidat. Les blinds = les étapes d'un process de
recrutement. **L'Espoir est le score ET la vulnérabilité** : il grimpe, il se
multiplie, il devient grotesque (architecture Balatro) — et c'est lui que le
« mais » convertit en dégâts (thèse inversée : chez Balatro le score est la
victoire, ici il est le piège). Le contre ultime — ne pas espérer — est une
prison, pas une solution : à 0 d'Espoir on est invulnérable et incapable
d'accepter une offre.

Les mécaniques racontent le propos. Aucun texte de morale, jamais.

## 2. Les ressources

Deux, pas douze (le brainstorm en avait produit 12 — élaguées) :
- **Espoir** — score, vulnérabilité, et durée du combat contre le Ghosteur.
- **Énergie** — 3 par tour, le coût des cartes.

## 3. Le tour et les actions

- **Jouer une carte** (coûte de l'Énergie).
- **Terminer le tour** (résout le risque, repioche).
- **Passer** — ne pas se manifester : risque réduit CE tour uniquement,
  interdit si une carte a été jouée. Coup optimal contre Prétentions Salariales.
- **Partir** — la seule victoire contre le Ghosteur (V0.5).
- **Retirer ma candidature** — carte du deck de départ, poids mort permanent…
  sauf le jour où c'est la condition de victoire (modèle : la Pilule de
  Réanimation de MGS3 — la sortie comme objet du jeu).

Identité de design : **les deux boss les plus durs se gagnent en ne jouant pas.**

## 4. Le système des mots (les intents)

Le mot pivot s'affiche seul, avant la phrase. Le joueur expérimenté sait déjà.
Échelle de gravité (à calibrer, du négociable au fatal) :

Certes · Bien que · Cependant · Toutefois · Néanmoins · Malgré · Hélas ·
Malheureusement · Nonobstant · Force est de constater · Nous avons le regret ·
Après une étude attentive

12 mots × N blinds = la variété de Slay the Spire (peu d'ennemis, beaucoup
d'intents) sans écrire une carte de plus. Le telegraphing est standard dans le
genre ; ici il EST la blague.

## 5. Les blinds

Un blind = règle + seuil. Pas de PV. Sa seule prise de parole : sa ligne de mort.

### Slice (V0.5)
| Blind | Kind | Règle | Ligne de mort |
|---|---|---|---|
| **ATS** | word-trigger | Bloque toute carte sans le mot-clé EXACT de l'offre (« Angular » ≠ « AngularJS »). Boss tutoriel : on apprend la règle en la subissant. | « CANDIDATURE NON RETENUE » (froid, machine) |
| **Ghosteur** | silent-decay | Pas de barre, pas de seuil, n'attaque jamais. L'Espoir se décompose, d'autant plus vite qu'il est haut — *le combat dure aussi longtemps que ton Espoir* (The Sorrow : le boss est fait de ce que TU as construit). Victoire = Partir. | **Aucune.** Retour au menu, silence. |

Le contraste des deux écrans (l'un parle, l'autre se tait) est toute la
caractérisation — le silence n'est lisible que parce que l'autre parle.

### Acte I (V1)
| Blind | Règle | Ligne de mort |
|---|---|---|
| **Recruteur** (référence proto) | Risque croissant avec l'Espoir, seuil 45 en 5 tours | « NOUS AVONS RETENU UN AUTRE PROFIL » / « NOUS AVONS REÇU DE TRÈS NOMBREUSES CANDIDATURES » |
| **Prétentions Salariales** | Chaque carte jouée = un chiffre annoncé. Passer est le coup optimal. Règle cachée : ne jamais parler en premier. | — |
| **Le Poste Fictif** | L'offre n'a jamais été ouverte. Pas de résolution possible. | (information neutre, ticket fermé) |
| **Le Manager qui a Pris un Senior** | Tout réussi, défaite scriptée. **L'UNIQUE boss sans sortie du jeu** — sa ligne est la plus humaine : | « NOUS AVONS RETENU UN AUTRE PROFIL » (politesse comparative : on ne te dit pas que tu étais mauvais, on te dit qu'il y avait mieux) |

### Blinds vécus (V1.5) — extraits de 7 histoires réelles, 7 causes de mort distinctes, zéro méchant
| Blind | Origine | Règle | Ligne de mort |
|---|---|---|---|
| **Le Gel Budgétaire** | « Je vous prends, je ne sais pas quand » puis silence | Victoire à 100 % possible — et défaite quand même, sur une variable hors-champ, sans auteur. Le jeu n'annonce jamais la défaite. | « La bonne nouvelle : le poste est à vous. La mauvaise : nous ne savons pas quand. » puis rien |
| **Le Relais** | Cascade ESN→client, poste pourvu pendant les vérifications | 3 validations séquentielles + un timer adverse INVISIBLE qui court en parallèle. On peut tout réussir et perdre à la vitesse. | « Ça a été trop long. » |
| **La Mutation Interne** | 3 entretiens réussis, poste pris par un interne | 3 interlocuteurs valident ; le 3e (le manager) porte un TELL discret que le joueur peut apprendre à repérer (« surpris, pas au courant »). Le concurrent n'a jamais postulé. | « Le poste a été pourvu par mobilité interne. » (neutre, administratif) |
| **Le Guichet Anonyme** | Relance 2 ans après avec passif → réponse template | Quel que soit ton historique, le système répond comme à une candidature à froid. Le système n'a pas de mémoire, même quand toi tu en as une. | « besoin de plus d'expérience » |
| **L'Entretien Différé** | Questionnaire 15 min justifié + vidéo → refus sans entretien | Chaque étape coûte de l'Énergie et **paie en Espoir** ; la récompense d'une étape est le droit de payer la suivante. Le seul blind qui FABRIQUE ta vulnérabilité au lieu de l'exploiter. Le mot lui-même ment : un « entretien » sans personne. | « Nous vous remercions du temps que vous avez consacré à ce processus. » |
| **Le Marathon** | Technique validée, éliminé sur des signes de stress en fin d'entretien long | Le SEUL blind dont le risque dépend du TEMPS, pas de l'Espoir : `computeRisk = f(turn)`. Il offre plus de tours que nécessaire (seuil atteignable en 4, il en donne 8) — le piège est de les utiliser. Le critère réel n'est jamais annoncé. Leçon apprise en jouant : finis vite, pars. | « Nous avons perçu quelques signes de nervosité en fin d'échange. » |
| **Le Doute** | Rituel qualités/défauts (« Si vous étiez un animal ? »), une phrase honnête → « on a tiqué », débrief des jours après | Un flag caché IRRÉVERSIBLE, posé par une seule carte — et le jeu ne dit pas laquelle ni quand : on l'apprend à l'écran de fin. Les déclencheurs sont les cartes HONNÊTES (Le Trou de CV Expliqué, la transparence) — bonnes partout ailleurs, fatales ici. La valeur d'une carte est contextuelle (cf. Le Diplôme). Aucune carte ne retire le doute. | « S'il y a un doute, c'est qu'il n'y a pas de doute. » |

Leçon commune Gel/Relais : *parfois on perd contre une horloge, pas contre un
adversaire* — l'horloge en amont (budget) ou en aval (dossier qui chemine).

**Relique associée (méta-run, long terme)** : *Ancien Contact* — jouable sur une
offre déjà croisée dans une run passée. Effet variable, non garanti : parfois la
porte s'ouvre, parfois rien (l'autorité a une durée de vie et expire hors-écran,
sans prévenir — « il n'a plus de pouvoir de recrutement »).

### Actes II+ (parqués)
ESN (« Le client cherche surtout quelqu'un de polyvalent » → transforme les
rares en communes), Négociateur TJM (« On n'a pas le budget » → chaque chiffre
contré), Junior avec 5 ans d'expérience (conditions contradictoires par design),
Manager Pressé (« Je n'ai eu que cinq minutes » → ignore les cartes puissantes),
La Cascade N1/N2/N3, Le Panel (trois interlocuteurs, un valide, un invalide, le
troisième observait).

## 6. Les cartes

Filtre qualité binaire : **extraire, jamais plaquer** (CLAUDE.md §3).
Public : tout le monde — pas de cartes développeur (Docker, SQL, Git : non).

### Le slice (12 cartes, implémentées dans `lib/engine/cards.ts`)
Entretien positif ×3 (×2 Espoir), Le poste correspond exactement ×2 (×3),
Candidature envoyée ×2 (+8), Mot-clé Exact ×3 (bouclier ×0.35),
Relance polie ×2 (risque ×0.6 ce tour). À compléter jusqu'à 12 défs distinctes
en V0.5 avec les catégories ci-dessous.

### Qui gonflent l'Espoir (le piège — belles, inutiles)
« On vous rappelle vendredi » (+3/tour, meurt vendredi) · Bannière Nébuleuse
(0 effet, +Espoir, on se sent mieux) · Les 768 Impressions · Post Sponsorisé
(20 €, mention visible à vie) · Le Groupe LinkedIn (438 783 membres) ·
Certification (+5 admiration RH, aucun effet réel) · **Passionné** (coût 0,
+300 Espoir, le Ghosteur apparaît immédiatement) · **Entreprise familiale**
(+150 Espoir, ajoute « On est une famille » au deck ennemi).

### Le vide légal (offre ce que tu possèdes déjà — effet net 0, +Espoir)
Mutuelle d'entreprise (obligatoire depuis 2016) · Remboursement transport 50 %
(obligatoire) · Congés payés (1936). Le jeu ne fait que citer la loi.

### Le petit vrai truc (honnête et dérisoire)
Babyfoot (+1 Énergie, une fois par run) · Corbeille de fruits · Afterwork
(récupère des PV de moral, perd du sommeil — à retraduire en Espoir/Énergie).

### Qui marchent (ennuyeuses exprès — zéro Espoir ; le filler assumé du jeu)
Mot-clé Exact · Relance polie (J+10) · Recommandation d'ex-manager (rare, forte,
silencieuse) · Portfolio (ignore une mécanique ATS) · Réseau (une fois par
acte : ignore un boss) · Le Trou de CV Expliqué (transforme une faiblesse en
narratif) · **Cooptation** (saute l'ATS — jamais la fin du process ; vécu
onepoint : le piston ouvre la porte, il ne gagne pas le combat).

### Double tranchant (les meilleures)
La Reconversion (buff ou debuff selon qui est en face) · Le Diplôme (l'ATS s'en
fout, le RH adore, le Manager s'en fout — valeur 100 % contextuelle) ·
Disponible immédiatement (×2 vitesse, −confiance : suspect) · Mode Créateur
(+portée, « Se connecter » caché) · 1h20 de Trajet (malus, annulé par
Télétravail Partiel) · **« On est une famille »** (+Espoir, **verrouille
l'action Partir** — on ne quitte pas sa famille ; te retire ta seule victoire
contre le Ghosteur).

### Malédictions
**Le Template Non Rempli** — « Merci pour votre candidature chez
`[#enseigne.nom#]` ». 0 dégât. Tu ne sauras jamais de qui. **La
carte-signature du jeu** — à mettre en avant dans la communication. ·
« Cependant » (tampon rouge : annule les bonus du tour) · Nous avons retenu un
autre profil (carte morte jusqu'à la fin de la run) · Manque d'expérience (ne
fait rien, occupe une place) · Salaire selon profil (effet inconnu. Vraiment
inconnu.) · Burn-out, Imposteur (+1 coût partout), Dette Technique.

### Reliques
**Expérience du candidat** — tu reconnais un refus aux trois premiers mots ;
les mails de refus sont sautés. **Le système de durée de vie du jeu** : run 1,
le mail intégral est imblocable (lettre par lettre, une seule fois) ; ensuite,
plus jamais. Le jeu te fait perdre du temps, puis te rend ton temps. La run 20
est plus rapide que la run 1. · Recommandations LinkedIn (à 5 : passif
« Crédibilité ») · Double CV LaTeX/Canva (deux faces : ATS / humaine) ·
Casque antibruit (immunité aux réunions — Acte III, parqué).

## 7. Les écrans de fin (les blinds ne parlent qu'ici)

| Fin | Écran |
|---|---|
| Brisé (2 casses) | Rouge sang sur noir, Georgia, fade-in lent, **silence puis** ding de notification joyeux (créé, pas Outlook). « NOUS AVONS RETENU UN AUTRE PROFIL » = la ligne du Manager (politesse comparative). L'ATS a la sienne, froide. |
| Sous le seuil | « NOUS AVONS REÇU DE TRÈS NOMBREUSES CANDIDATURES » + détail : « Dossier final : X — l'offre exigeait 45. » |
| Passif | **Gris plat, sans-serif, sans solennité** — le vide ne mérite pas une belle typo. « Vous n'avez rien risqué. Vous n'avez rien obtenu non plus. » Ni puni ni récompensé : constaté. |
| Ghosteur | **Rien.** Retour au menu. |
| RH (V1) | « Après une étude attentive… » — l'écran s'éteint AVANT la fin de la phrase (le système des mots appliqué à la mort). |
| Victoire de blind | « ENTRETIEN CONFIRMÉ » → bouton **« Continuer »** (jamais « rejouer » : on a gagné une bataille, pas la guerre). |

Le YOU DIED de Dark Souls est le vocabulaire, pas la blague : la solennité est
MÉRITÉE (tu viens réellement de perdre quelque chose). Référence = étage bonus,
jamais plancher.

## 8. Le générateur par assemblage (V1)

Les vrais refus SONT des templates fusionnés (preuve : Le Template Non Rempli).
Donc les générer par morceaux n'est pas un raccourci — **c'est le sujet** :
- Refus = formule d'ouverture + délai + **mot pivot** + clôture.
- Offre = intitulé + faux avantages (dont vide légal) + **un red flag caché**.
- Ligne à haute fréquence dans le pool (vécue deux fois) : « besoin de plus
  d'expérience ».
L'offre EST le niveau : ses « avantages » sont les modificateurs de règles
(le blind de Balatro), et on la lit entre les lignes AVANT de postuler
(Papers Please : inspecter le document, chercher l'incohérence).
Red flags canon : Salaire selon profil · Jeune équipe dynamique · Autonome ·
Polyvalent · Poste évolutif · On est une famille · Babyfoot.

## 9. Les profils (V1.5)

Profil = deck + reliques **de départ** (jamais des drops — on n'acquiert pas
une grande école à 35 ans). Trois puzzles, pas trois curseurs de difficulté :
- **Junior** : beaucoup d'Espoir, peu de mots-clés — l'ATS le massacre. (Le slice.)
- **Senior** : passe l'ATS, le RH le rappelle — puis « Surqualifié », et plus
  d'Espoir. Il commence là où le Junior finit ; il doit **générer** de l'Espoir
  (le verbe inverse). Le blindage est la prison.
- **Reconverti** : Espoir légitime (il a choisi, il s'est battu), lu comme un trou.

## 10. La méta-progression (décision de principe)

**Le déblocage, c'est la connaissance** (The Sorrow : on se bat avec du savoir).
Run 1 : le Ghosteur te dévore, tu perds. Run 5 : tu pars au 3e tour. Personne
ne t'a fait la leçon — le jeu te l'a fait vivre. **Jamais de popup « Conseil
n°7 »** : la reconnaissance est déjà la charge utile. Le SYSTÈME de déblocage
(reliques, cartes, savoir) se code ; le contenu exact (faut-il en plus des
conseils textuels ?) se tranche tard, en jouant. Les succès portent la même
fonction avec de l'humour : « Je savais » (reconnaître un refus avant le
premier « mais »), « Lu en diagonale », « Culture Fit » (perdre après avoir
tout réussi), « Premier ghosting », « Le candidat parfait n'existe pas ».

## 11. Le PNJ récurrent (V1)

**Le Recruteur LinkedIn** (fonction Jorji Costava : la chaleur du jeu). Il te
contacte à chaque run. Il ne te reconnaît jamais. Le poste ne correspond
jamais. Il est enthousiaste. 50 % : « C'était juste pour agrandir mon réseau. »
À la run 10, tu es content de le voir. Un seul PNJ, intitulés générés, coût
ridicule.

## 12. Références (le rôle exact de chacune)

| Référence | Ce qu'on prend | Ce qu'on ne prend PAS |
|---|---|---|
| Bois Maudit (Hearthstone) | Structure : buckets (paquets de 3 cartes thématiques = 1 blague complète), trésors volontairement cassés, runs courtes (~25 min), déséquilibre joyeux | Le visuel fantasy |
| Balatro | Blind = règle + seuil ; le score multiplicatif ; peu de contenu, beaucoup de combinaisons | Le score comme victoire (ici : piège) |
| Slay the Spire | Les intents (→ les mots) ; profils = questions différentes | L'attrition à PV ; rien d'autre (jeu non joué — pas de cargo cult) |
| Papers Please | La bureaucratie comme gameplay ; inspecter un document ; le déadpan glacial ET humain | La complicité morale (le joueur est le PAPIER, pas le bureaucrate — pas de dilemme côté guichet avant l'Acte III) |
| MGS3 The Sorrow | Le boss fait de ce que TU as construit ; se battre avec du savoir ; la sortie contre-intuitive | — |
| Caméra Café / Groland / Dark Souls | La tendresse / le déadpan premier degré / le vocabulaire de la solennité | Personnages, répliques, noms (œuvres protégées) ; le peon de Warcraft : remplacer par nos propres murmures (« Je reviens vers vous ») |

## 13. Journal de playtest (proto v1 → v5)

| Version | Constat du playtest | Correction |
|---|---|---|
| v1 | Le joueur contrôle les deux camps (il clique « Cependant » lui-même) ; l'ordre est neutre (8×2×3 = 8×3×2) | v2 : déclenchement probabiliste lié à l'Espoir, Énergie 3/tour, Passer, cartes utilitaires |
| v2 | **Bug 1** : 5× Passer à Espoir 0 → victoire (garde-fou `hope > 0` codé en dur) ; **Bug 2** : la réduction de risque de Passer colle indéfiniment ; **Bug 3** : la passivité produit le même écran que l'engagement | v3 : reducer unique, état immuable, 3e statut `passive` (écran gris plat), seuil d'engagement (cumul généré ≥ 20) |
| v3 | On gagne tout le temps, même à 4 d'Espoir final (la victoire ne regardait que le cumul) ; tours morts après épuisement des 4 cartes uniques | v4 : **LE SEUIL** (Espoir FINAL ≥ 45 — la moitié « score » de la thèse) + **pioche/défausse** (12 cartes, main de 3) + Passer interdit après avoir joué + 2 lignes de mort distinctes |
| v4 | « Ça me fait réviser des multiplications » | v5 : **règle d'information** — aperçu calculé sur chaque carte (« 16 → 32 », coche verte au seuil), le risque reste vague |
| v5 | Première anecdote authentique : « je suis monté à plus de 100, *vous y croyez un peu trop*, et bim, sous les 45 » — la défaite se sent JUSTE, pas volée | Validation de la thèse. Les 3 bugs = tests de non-régression nommés dans `lib/engine/__tests__/`. |

Leçon d'architecture : les 3 bugs avaient UNE cause (flags mutables mis à jour
à plusieurs endroits). Le reducer les rend impossibles par construction, pas
par prudence.

## 14. Décisions actées / questions ouvertes

**Acté** : nom interne (ne pas publier avant le premier jouable) · repo privé ·
pas de PV · déséquilibre assumé · FR d'abord, EN refait · slice = ATS +
Ghosteur + 12 cartes + profil Junior · le proto v5 = référence de comportement
et de style · aucune carte « victoire à 100 % », jamais.

**Ouvert** : contenu exact de la méta-progression (savoir seul vs + conseils
textuels — trancher en jouant) · calibrage seuil/risque/casse (45 / hope÷130 /
×0.1 sont les valeurs v5, à re-tester avec l'ATS) · wording final de l'écran
passif · design sonore · le nom public.

**Parqué (idées visuelles)** : skin « plateau de jeu » parodique (cadre doré
façon Hearthstone rempli de contenu corporate) — gag à un coup qui casserait
le déadpan en jeu de base ; envisageable uniquement comme easter egg ou
récompense de succès caché, la référence en étage bonus, jamais en plancher
(CLAUDE.md §3 et §6).
