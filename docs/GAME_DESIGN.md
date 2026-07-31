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

**Implémenté (V0.5, valeurs à retester en playtest)** : l'ATS exige le mot
`Autonome` (red flag canon) ; 6 des 12 cartes le portent (le dossier optimisé
machine), 6 ne le portent pas (les vraies qualités, illisibles par le filtre) ;
seuil 24 en 4 tours, ne casse jamais. Le Ghosteur décompose l'Espoir de
`min(0.7, 0.2 + hope/150)` par tour (plus tu y crois, plus vite ça s'efface),
8 tours max, l'Espoir gagné à l'ATS est reporté. Le choix du mot et des cartes
qui le portent relève de la règle d'extraction (§3) : à affiner avec de vraies
offres, la structure moteur (isBlocked / requiredKeyword) ne bouge pas.

### Acte I (V1) — implémenté

**Valeurs du code (à retester en playtest)** : Mouton seuil 40 en 6 tours,
pénalité de 25 % d'Espoir par exigence non couverte, neutralisée par Transparence
assumée (garantie ×2 dans le deck). Poupée Russe 3 couches, seuil 20 puis +18 par
couche, récompense ×0,6 par couche, 8 tours qui ne se réinitialisent pas.
Prétentions seuil 22 en 5 tours, risque = 0,26 par chiffre annoncé. Poste Fictif
6 tours, l'Espoir tombe à 0 à la fermeture du ticket. Manager 5 tours, défaite
inconditionnelle.

⚠ **Lignes de mort proposées, PAS extraites** (à remplacer par de vraies phrases
reçues) : Poste Fictif « L'offre a été retirée. », Poupée Russe « Votre dossier
n'a pas été transmis à l'échelon suivant. », Prétentions « Vos prétentions sont
au-dessus de notre fourchette. » et « Le poste a été pourvu pendant la
négociation. ».

| Blind | Règle | Ligne de mort |
|---|---|---|
| **Recruteur** (référence proto) | Risque croissant avec l'Espoir, seuil 45 en 5 tours | « NOUS AVONS RETENU UN AUTRE PROFIL » / « NOUS AVONS REÇU DE TRÈS NOMBREUSES CANDIDATURES » |
| **Prétentions Salariales** | Chaque carte jouée = un chiffre annoncé. Passer est le coup optimal. Règle cachée : ne jamais parler en premier. | — |
| **Le Poste Fictif** | L'offre n'a jamais été ouverte. Pas de résolution possible. | (information neutre, ticket fermé) |
| **L'Offre Mouton à Cinq Pattes** | Escalade : chaque tour révèle une exigence de plus, tirée au hasard, sans limite. Impossible à couvrir par construction. Se gagne en NOMMANT ses lacunes (Transparence assumée), pas en cochant les cases. Récompense affichée fluctuante (La Fourchette Schrödinger). Fiche détaillée ci-dessous. | « Votre profil est intéressant mais nous cherchons quelqu'un de plus polyvalent. » |
| **La Poupée Russe** | Formes successives quasi identiques, seul le badge change. Chaque couche franchie **relève le seuil** exigé, le compteur de tours ne se réinitialise pas, et la récompense affichée fond. Zéro PV. Fiche détaillée ci-dessous. | (à définir) ; la ligne de **victoire** est « Le décideur vous recevra ultérieurement. » |
| **Le Manager qui a Pris un Senior** | Tout réussi, défaite scriptée. **L'UNIQUE boss sans sortie du jeu** — sa ligne est la plus humaine : | « NOUS AVONS RETENU UN AUTRE PROFIL » (politesse comparative : on ne te dit pas que tu étais mauvais, on te dit qu'il y avait mieux) |

#### Fiche — L'Offre Mouton à Cinq Pattes

**Placement** : étape intermédiaire, AVANT le boss RH et le Négociateur TJM.
Placé tôt, il sert de révélation à la mécanique de méta-progression.

**Le nom** : « mouton à cinq pattes » est l'expression que les recruteurs
emploient eux-mêmes pour désigner le profil impossible qu'ils cherchent.
Extraction fidèle, comprise par tout le monde. (« Offre Chimère » écarté :
sonne inventé.)

**Pattern source (réel)** : une annonce unique empile en un seul poste une
douzaine d'exigences hétérogènes, réclame une « très forte expertise » sur des
domaines émergents, et affiche une fourchette du simple au double — signe que
personne n'a réfléchi au profil cherché. Détail le plus fort du matériau :
la fourchette annoncée au centime près (« 32 065,43 € à 62 356,03 € ») sur une
plage du simple au double. La fausse rigueur comptable posée sur une donnée
totalement floue. Personne n'a besoin de connaître le métier pour rire.

**⚠ Désjargonnage obligatoire (CLAUDE.md §3, cible = tout le monde)** : le
matériau source est une annonce de développeur. Le DISPOSITIF est universel, le
vocabulaire ne l'est pas. Interdiction d'utiliser les termes techniques du
source (Docker, microservices, RAG, prompt engineering, .NET, NoSQL…) : ce
serait le contenu le plus « dev » du jeu, contre la règle explicite (« Docker
n'est pas une carte, "Malheureusement" oui »). Pool d'exigences par défaut,
lisible par n'importe qui : polyvalent · autonome · souriant · disponible le
week-end · 3 ans d'expérience · permis B · anglais courant · bon relationnel ·
capacité à gérer le stress · esprit d'équipe · force de proposition · mobile
nationalement · maîtrise du Pack Office · sens du service client. Même
absurdité, même escalade, zéro barrière d'entrée. Une variante « tech » serait
un pool ALTERNATIF de la même mécanique, jamais le pool par défaut.

**Gimmick — La Liste Infinie** : à chaque tour, le blind révèle une nouvelle
exigence tirée au hasard. Le joueur doit posséder une carte correspondante pour
ne pas subir de dégâts. La liste étant générée sans limite, il est
mathématiquement impossible de tout couvrir. Le jeu doit le faire RESSENTIR,
jamais l'expliquer.

**Condition de victoire (le twist)** : le blind ne se bat pas en cochant les
cases. Il se bat avec **Transparence assumée** (carte déjà en banque : révéler
soi-même une faiblesse neutralise l'attaque). Ici, nommer explicitement ce
qu'on ne maîtrise pas neutralise la Liste Infinie pour le reste du combat.
Bluffer sur toutes les exigences → défaite. Assumer un sous-ensemble réel et
nommer ses lacunes → victoire.

**⚠ Risque de conception, à trancher en playtest** : si une seule carte
débloque la victoire et qu'elle n'est pas piochée, le combat devient injouable
et se lira comme arbitraire (le reproche exact évité depuis le proto v5). Deux
parades à tester : (1) Transparence assumée garantie dans le deck face à ce
blind ; (2) une seconde voie de victoire — jouer très peu de cartes (assumer un
sous-ensemble par le silence plutôt que par la parole).

**Effet secondaire — La Fourchette Schrödinger** : le montant de récompense
affiché fluctue à chaque tour entre une valeur basse et une valeur haute, et
n'est fixé qu'au moment de la victoire, par un tirage. Traduction mécanique
exacte du gag source. Afficher les montants AU CENTIME PRÈS : la fausse
précision EST la blague, ne jamais arrondir. (Variante parquée : un curseur
« devinez la vraie fourchette » à placer soi-même, version interactive du même
gag.)

**Parqué — « devine mon salaire » (outil séparé ou mini-jeu)** : écarté sous
cette forme, pour trois raisons. (1) Formulé « selon la stack et l'expérience »,
il ne parle qu'aux développeurs (§3, désjargonnage ci-dessus). (2) En projet
séparé, sa valeur tient à 100 % à la qualité d'une base salariale : sans données
réelles, l'outil ment avec assurance, et il diviserait l'effort avant même le
premier playtest du slice. (3) En mini-jeu scoré, il rouvrirait une 3e ressource
et CONTREDIRAIT Prétentions Salariales, dont la règle cachée est « ne jamais
parler en premier » : faire annoncer un chiffre au joueur enseigne l'inverse.
Forme conservée = le curseur ci-dessus, où la révélation n'est pas « as-tu bien
estimé le marché ? » mais « ton estimation n'avait aucune importance » (le budget
réel était sous le bas de la fourchette, ou le poste part en mobilité interne).

**Flavor (extraction, ne rien ajouter)** : titre « Nous recherchons un profil
rare » · apparition « Maîtrise de quatre domaines exigée. Poste junior. » ·
révélation d'exigence « Ah, et une très forte expertise en [X]. » · défaite du
joueur « Votre profil est intéressant mais nous cherchons quelqu'un de plus
polyvalent. » · victoire « Finalement on va prendre un alternant. »

**Écarté** : le loot « le poste n'exigeait en réalité que 3 compétences sur
25 ». Révélation inventée, non extraite. La ligne de victoire ci-dessus dit la
même chose, en vrai et en plus drôle.

**Anonymisation** : l'annonce source cite des entreprises et des produits réels.
Aucun ne doit apparaître dans le jeu, un commit, une variable ou un asset
(CLAUDE.md §2). Les exigences restent génériques.

**Chevauchement à documenter** (sinon deux blinds redondants seront créés) : ce
blind coexiste avec « Junior avec 5 ans d'expérience » (Actes II+). Les deux
parodient l'annonce impossible, mais diffèrent.

| | Junior avec 5 ans d'exp. | Mouton à Cinq Pattes |
|---|---|---|
| Nature | Contradiction **figée** (junior ET senior) | **Escalade** dans le temps |
| Lecture | Visible d'emblée sur l'annonce | Se découvre tour après tour |
| Victoire | (à définir) | Transparence assumée |

#### Fiche — La Poupée Russe

**Le gag universel** : tu bats un interlocuteur, et derrière il y en a un autre,
identique, qui t'annonce qu'il n'est pas non plus le décideur. Puis encore un
autre. Le vrai décideur n'est jamais atteint. Aucune connaissance d'un secteur
n'est requise : c'est le ressort du service client qui transfère en boucle.
**Garder cette lecture-là comme référence d'écriture**, jamais le vocabulaire
des intermédiaires professionnels.

**⚠ Correction d'architecture obligatoire (pas de PV)** : le brouillon prévoyait
que « chaque forme vaincue restaure une partie des PV de la suivante ». Les PV
sont le modèle explicitement écarté (CLAUDE.md §1 : un blind est une règle + un
seuil, jamais une créature). Version correcte, et plus cruelle :
- plusieurs **formes successives**, visuellement quasi identiques, seul un badge
  change (« Intermédiaire », « Second intermédiaire », « Partenaire de
  l'intermédiaire »…) ;
- **chaque couche franchie RELÈVE le seuil d'Espoir exigé** : tu approches, la
  barre monte, tu approches encore ;
- **le compteur de tours ne se réinitialise pas** entre les couches : la
  pression monte mécaniquement.

Aucun PV nécessaire. Le sentiment que l'énergie dépensée est absorbée par la
chaîne est rendu par le seuil qui se dérobe, pas par une barre de vie.

**Twist — la récompense qui fond** : à chaque couche franchie, la récompense
finale affichée diminue (chaque intermédiaire prend sa marge). Le joueur voit le
gain fondre pendant qu'il se bat. Cousin de la Fourchette Schrödinger (fiche
ci-dessus) : les deux jouent sur un chiffre affiché qui ne veut rien dire, mais
ils ne font PAS doublon — ici le chiffre décroît de façon lisible, là il fluctue
au hasard.

**Condition de sortie (à tester en playtest)** :
- **Option A (satirique)** : impossible de gagner par la force. Il faut une carte
  type *Contact direct* / *Réseau* pour court-circuiter la chaîne.
- **Option B (endurance)** : on peut aller au bout, mais la récompense est
  devenue si faible que la leçon est ailleurs.

⚠ Si l'option A est retenue, appliquer le même garde-fou que pour le Mouton à
Cinq Pattes : une victoire qui dépend d'UNE SEULE carte non garantie se lit
comme arbitraire si elle n'est pas piochée.

**Flavor** : forme 1 « Je transmets votre profil à mon partenaire. » · forme 2
« Je transmets votre profil au client. » · forme 3 « Le client souhaite un
dernier échange avec son prestataire. » · victoire « Le décideur vous recevra
ultérieurement. »

**Reformulé** : le brouillon disait « Vous rencontrerez le décideur au prochain
run ». Drôle, mais ça casse la fiction en nommant le run. La version retenue dit
la même chose en restant dans la langue de l'institution.

**Chevauchement à documenter** (sinon deux blinds redondants seront créés) : ce
blind coexiste avec « La Cascade N1/N2/N3 » (Actes II+).

| | La Cascade N1/N2/N3 | La Poupée Russe |
|---|---|---|
| Effet | **Annule ta progression** à chaque étape | **Déplace la cible** (seuil qui monte) |
| Récompense | inchangée | **fond à chaque couche** |
| Ressenti | on recommence | on n'arrive jamais |

**Ton et anonymisation** : la cible est le système et sa complexité absurde,
jamais les personnes qui y travaillent. Les formes restent des fonctions
génériques, jamais des portraits. Aucune entreprise réelle nommée (CLAUDE.md §2).

**Lien avec la carte Exclusivité** (§6, double tranchant) : les deux idées
viennent de la même situation vécue et se complètent. La Poupée Russe montre la
chaîne d'intermédiaires, l'Exclusivité montre le coût d'y entrer. Elles peuvent
former un mini-acte cohérent, l'Exclusivité étant trouvée juste avant le blind
à couches.

### Blinds vécus (V1.5) — extraits de 8 histoires réelles, 8 causes de mort distinctes, zéro méchant
| Blind | Origine | Règle | Ligne de mort |
|---|---|---|---|
| **Le Gel Budgétaire** | « Je vous prends, je ne sais pas quand » puis silence | Victoire à 100 % possible — et défaite quand même, sur une variable hors-champ, sans auteur. Le jeu n'annonce jamais la défaite. | « La bonne nouvelle : le poste est à vous. La mauvaise : nous ne savons pas quand. » puis rien |
| **Le Relais** | Cascade ESN→client, poste pourvu pendant les vérifications | 3 validations séquentielles + un timer adverse INVISIBLE qui court en parallèle. On peut tout réussir et perdre à la vitesse. | « Ça a été trop long. » |
| **La Mutation Interne** | 3 entretiens réussis, poste pris par un interne | 3 interlocuteurs valident ; le 3e (le manager) porte un TELL discret que le joueur peut apprendre à repérer (« surpris, pas au courant »). Le concurrent n'a jamais postulé. | « Le poste a été pourvu par mobilité interne. » (neutre, administratif) |
| **Le Guichet Anonyme** | Relance 2 ans après avec passif → réponse template | Quel que soit ton historique, le système répond comme à une candidature à froid. Le système n'a pas de mémoire, même quand toi tu en as une. | « besoin de plus d'expérience » |
| **L'Entretien Différé** | Questionnaire 15 min justifié + vidéo → refus sans entretien | Chaque étape coûte de l'Énergie et **paie en Espoir** ; la récompense d'une étape est le droit de payer la suivante. Le seul blind qui FABRIQUE ta vulnérabilité au lieu de l'exploiter. Le mot lui-même ment : un « entretien » sans personne. | « Nous vous remercions du temps que vous avez consacré à ce processus. » |
| **Le Marathon** | Technique validée, éliminé sur des signes de stress en fin d'entretien long | Le SEUL blind dont le risque dépend du TEMPS, pas de l'Espoir : `computeRisk = f(turn)`. Il offre plus de tours que nécessaire (seuil atteignable en 4, il en donne 8) — le piège est de les utiliser. Le critère réel n'est jamais annoncé. Leçon apprise en jouant : finis vite, pars. | « Nous avons perçu quelques signes de nervosité en fin d'échange. » |
| **Le Doute** | Rituel qualités/défauts (« Si vous étiez un animal ? »), une phrase honnête → « on a tiqué », débrief des jours après | Un flag caché IRRÉVERSIBLE, posé par une seule carte — et le jeu ne dit pas laquelle ni quand : on l'apprend à l'écran de fin. Les déclencheurs sont les cartes HONNÊTES (Le Trou de CV Expliqué, la transparence) — bonnes partout ailleurs, fatales ici. La valeur d'une carte est contextuelle (cf. Le Diplôme). Aucune carte ne retire le doute. | « S'il y a un doute, c'est qu'il n'y a pas de doute. » |
| **Le Consultant Loyal** | Deux interlocuteurs de la même organisation, deux postures opposées sur la même info : la RH nomme le client spontanément, le Consultant (loyal à un ami côté client) ne le mentionne jamais | Deux phases, pas un seuil probabiliste. Phase RH : révèle « Client : [nom fictif générique] ». Phase Consultant : ne révèle rien ; l'action **Reprendre l'info** (1 Énergie) force le sujet en citant la RH et débloque de la visibilité PURE — zéro Espoir, zéro garantie. Le tell n'est pas un détail annexe : c'est l'INCOHÉRENCE entre les deux interlocuteurs. Défaite pré-arbitrée par la loyauté, possible même en forçant la question correctement. | « Le poste a été confié à un profil recommandé en interne. » |

Leçon commune Gel/Relais : *parfois on perd contre une horloge, pas contre un
adversaire* — l'horloge en amont (budget) ou en aval (dossier qui chemine).

**Variantes de L'Entretien Différé** (mêmes règles, pas de nouveau boss) : le
test technique « une feature entière à coder gratuitement » et le recrutement
« par simulation / mise en situation » qui n'aboutit pas. Même structure :
travail gratuit exigé avant qu'un humain apparaisse. Ne PAS créer de carte
« code une feature » (ça ne parle qu'aux devs) — la version universelle est
déjà le blind (questionnaire + vidéo), que le boulanger a vécue aussi.

**Mécanique du Consultant Loyal** (nouvelle action « Reprendre l'info ») : forcer
la question ne rapporte que de l'INFORMATION, jamais de l'Espoir ni une garantie.
C'est le cœur de l'histoire source : poser une question qu'on ne devrait pas
avoir à poser, et découvrir que même la bonne réponse n'aurait rien changé (la
décision était prise en amont, hors de l'entretien). Distinct du Doute : là, le
flag est caché dans une carte honnête ; ici, le signal est VISIBLE dès la 2e run,
dans le désaccord entre la RH et le Consultant. Techniquement, « Reprendre
l'info » est une action au même titre que Partir (Ghosteur) — support moteur à
prévoir en V1.5.

**Relique associée (méta-run, long terme)** : *Ancien Contact* — jouable sur une
offre déjà croisée dans une run passée. Effet variable, non garanti : parfois la
porte s'ouvre, parfois rien (l'autorité a une durée de vie et expire hors-écran,
sans prévenir — « il n'a plus de pouvoir de recrutement »). Variante de lecture :
si l'offre revient TRÈS vite (quelques runs) et À L'IDENTIQUE, ce n'est pas une
seconde chance ambiguë mais un signal plus sombre — soit le poste n'a jamais
tenu, soit le process ne visait jamais vraiment à recruter. Le joueur apprend à
lire ce signal avec l'expérience (savoir, pas texte explicatif — cohérent §10).

### Actes II+ (parqués)
ESN (« Le client cherche surtout quelqu'un de polyvalent » → transforme les
rares en communes), Négociateur TJM (« On n'a pas le budget » → chaque chiffre
contré), Junior avec 5 ans d'expérience (conditions contradictoires par design),
Manager Pressé (« Je n'ai eu que cinq minutes » → ignore les cartes puissantes),
La Cascade N1/N2/N3, Le Panel (trois interlocuteurs, un valide, un invalide, le
troisième observait).

**Note croisée — Junior avec 5 ans d'expérience** : ne pas le confondre avec
L'Offre Mouton à Cinq Pattes (Acte I). Les deux parodient l'annonce impossible,
mais celui-ci est une contradiction FIGÉE, visible d'emblée sur l'annonce ;
l'autre est une ESCALADE qui se découvre tour après tour. Voir la table de
comparaison dans la fiche du Mouton à Cinq Pattes.

**Note croisée — La Cascade N1/N2/N3** : ne pas la confondre avec La Poupée
Russe (Acte I). La Cascade ANNULE ta progression à chaque étape (on recommence) ;
la Poupée Russe DÉPLACE la cible en relevant le seuil (on n'arrive jamais), et
sa récompense fond à chaque couche. Voir la table de comparaison dans la fiche
de La Poupée Russe.

### Événements d'ambiance (entre deux blinds, V1.5)
Pas des blinds : des interruptions courtes pendant la recherche (concrétise la
piste « caméra café »). **Le Webinaire** — « Boostez votre carrière avec l'IA ».
Te sollicite, coûte de l'Énergie (ton temps), ne donne rien ou une carte
cosmétique (cf. Bannière Nébuleuse). La niche du conseil-carrière se nourrit de
ta détresse sans la résoudre. Vise le processus, jamais les personnes.

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

**Exclusivité** (la plus forte de la catégorie) — la SEULE carte de la banque
dont le coût est une **fermeture**, pas un malus. Les autres double-tranchant
modifient des valeurs (1h20 de Trajet : malus chiffré ; Mode Créateur : un plus
et un moins ; Disponible immédiatement : vitesse contre confiance) ; celle-ci
**retire des options du jeu**. La mécanique EST la définition du mot : extraction
parfaite (CLAUDE.md §3). Même famille que « On est une famille », qui verrouille
l'action Partir : les cartes qui te retirent quelque chose au lieu d'en diminuer
la valeur.
- **Effet immédiat positif** (elle doit être tentante) : avance d'une étape, gain
  d'Énergie, ou saute une phase de blind.
- **Effet permanent négatif** : pour le reste du run, toutes les autres cartes de
  la même catégorie sont retirées de la main ET de la pioche.
- **Variante retenue, face cachée** : le joueur voit le bonus, pas l'engagement
  auquel il souscrit ; le contenu réel n'est révélé qu'au tour suivant. Parodie
  directe d'un engagement signé avant de savoir sur quoi il porte.
- **⚠ Question ouverte (tension avec la règle d'information, §4)** : « précis de
  ton côté, brouillard du leur ». C'est SA carte, son coût devrait donc lui être
  lisible. Deux voies, préférence pour la première : (1) la carte affiche
  « engagement exclusif » sans détailler ce qu'elle ferme, assez pour se méfier,
  pas assez pour calculer ; (2) assumer l'exception UNE seule fois (première
  partie), puis marquer l'effet complet au codex pour les runs suivants.
- **Flavor** : « Vous acceptez d'être représenté exclusivement. Par qui ? On vous
  le dira après. » · au déclenchement de l'effet négatif : « Ces cartes ne vous
  sont plus accessibles. Vous êtes déjà engagé. »
- Voir aussi le blind **La Poupée Russe** (§5, Acte I) : même situation source,
  les deux forment un mini-acte cohérent.

**Pas les bons codes / réseau** (à trancher) — l'inversion de Cooptation : et si
l'ABSENCE de réseau était un débuff, plutôt que Cooptation un buff ? Deux angles
sur la même vérité. Forme forte à tester : sans carte Réseau, certains blinds ne
sont pas plus DURS, ils sont **invisibles** (le marché caché, le « guanxi » — le
joueur ne les voit même pas). L'absence de réseau rétrécit le champ des
possibles, elle n'ajoute pas un malus de puissance.

Note flavor cosmétique : un **score de conformité affiché sur une carte**
(« Compliance : 98 % ») est autorisé comme PUR décor mimant le scoring ATS,
jamais une ressource — un chiffre à côté de l'effet réel en Espoir.

### Malédictions
**Le Template Non Rempli** — « Merci pour votre candidature chez
`[#enseigne.nom#]` ». 0 dégât. Tu ne sauras jamais de qui. **La
carte-signature du jeu** — à mettre en avant dans la communication. ·
« Cependant » (tampon rouge : annule les bonus du tour) · Nous avons retenu un
autre profil (carte morte jusqu'à la fin de la run) · Manque d'expérience (ne
fait rien, occupe une place) · Salaire selon profil (effet inconnu. Vraiment
inconnu.) · Burn-out, Imposteur (+1 coût partout), Dette Technique · **Trop
bougé** (job-hopping puni, tampon rouge).

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

**Dispositif — le boss épique sur enjeu dérisoire** : présenter un blind avec
tout l'apparat d'un boss (barre massive, nom en capitales, solennité, musique)
pour un enjeu ridicule (« répondre à une offre de stagiaire »). L'emballage
solennel sur le vide = la thèse visuelle (cousin de la musique corporate
enjouée qui te détruit). Garder le dispositif, jamais une private joke
nominative.

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

Deux dispositifs collectionnables (à tester, cohérents avec « le déblocage =
connaissance ») :
- **Le portfolio de refus** : les cartes « Refus » collectées en jouant sont
  inutiles en combat mais forment un récit. Réunir trois contradictions vécues
  — « refus technique » + « surqualifié » + « pas assez d'expérience » —
  débloque « Candidat paradoxal » (carte forte, coût 0, débloquable UNIQUEMENT
  après avoir subi les trois). La banalité du refus devient mécanique : après N
  runs on a reçu 30 refus sans se souvenir d'aucun — le refus est le fond
  sonore, pas l'événement.
- **Le Feedback comme récompense rare** : le jeu ne dit jamais POURQUOI on a
  perdu (« Malheureusement », point). Une carte/relique « Feedback » se débloque
  très tard (ex. 20 runs) et révèle enfin la vraie cause d'une défaite passée.
  Le jeu reproduit l'ignorance du candidat ; lever cette ignorance EST la
  récompense.

**Banque de conseils candidats** (à n'utiliser QUE si la question ouverte
« savoir seul vs conseils textuels » se tranche en faveur des textes ; sinon ces
lignes restent en doc, jamais à l'écran). Déjà écrits pour respecter §8 (aucun
tiret cadratin, phrases courtes), donc utilisables tels quels :
- *Mouton à Cinq Pattes* : « Face à une annonce qui empile les exigences, ne
  coche pas les cases par principe. Nomme précisément ce que tu maîtrises et ce
  que tu ne maîtrises pas. Sur un poste flou, la lucidité te distingue plus
  sûrement que l'exhaustivité. Elle te protège aussi d'un entretien qui
  démonterait le bluff. »
- *Exclusivité / La Poupée Russe* : « Avant de signer une exclusivité, demande
  qui est le client final. Une exclusivité porte sur une opportunité précise, pas
  sur tout un secteur. Si tu ne sais pas sur quoi tu t'engages, tu ne peux pas
  savoir ce que tu fermes. »

## 11. Le PNJ récurrent (V1)

**Le Recruteur LinkedIn** (fonction Jorji Costava : la chaleur du jeu). Il te
contacte à chaque run. Il ne te reconnaît jamais. Le poste ne correspond
jamais. Il est enthousiaste. 50 % : « C'était juste pour agrandir mon réseau. »
À la run 10, tu es content de le voir. Un seul PNJ, intitulés générés, coût
ridicule.

Terrain concret : le **message privé**. Il t'aborde en DM, s'enthousiasme, « je
ne retrouve plus la notif », disparaît. Le vent en message privé, le « c'était
juste pour agrandir mon réseau ».

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

**À tester en proto (peut enrichir, peut alourdir — pas des acquis)** :
- **Le risque de conformité caché** : jouer certaines cartes ajoute un risque
  invisible, affiché en tags corporate (« CONFORME » / « VIGILANCE INTERNE » /
  « ALERTE CRITIQUE »), jamais en % (la règle d'information §4 sur une 2e
  dimension). Trop pousser déclenche un audit qui remet l'Espoir à 0. Garde-fous
  impératifs : (1) PAS une 3e ressource pilotée — une PROPRIÉTÉ de certaines
  cartes (comme les double-tranchant), pas une jauge ; (2) déclencheurs
  HONNÊTES, jamais des cartes de fraude (enjoliver, faux certif, piston) : ça
  inverserait la thèse, le joueur deviendrait le fraudeur.
- **Le temps comme ressource finie** (couche méta-run, PAS 3e ressource en
  combat) : au fil des runs, une carte entre dans le deck sans qu'on la choisisse
  (« vous avez pris de l'expérience / de l'âge », cousin de « Jeune équipe
  dynamique »). Elle ne fait rien de visible, mais rend certains blinds « poste
  pour junior » inaccessibles, forçant à pivoter (Management, Reconversion).
  Meilleure formulation que le profil Senior statique (§9) : ici le temps est une
  dérive subie, pas un choix de départ.

**Garde-fous de vigilance (reconfirmés, ne rien changer)** : le joueur est la
victime faillible d'un processus absurde, JAMAIS le tricheur — rejeter toute
carte qui fait de lui le fraudeur (CV enjolivé, piston, effacer ses traces). ·
Nommage : rejeter « KPI », « Hope Index », « Bande Passante » et tout jargon
corporate/anglais — Espoir reste Espoir, Énergie reste Énergie (cible = tout le
monde, pas les gens du corporate). · Plusieurs outils externes reconstruisent
spontanément le système (compteur central, seuil, pastilles d'énergie, job
board) : validation de solidité de l'architecture, pas une source de contenu.

**Parqué (idées visuelles)** : skin « plateau de jeu » parodique (cadre doré
façon Hearthstone rempli de contenu corporate) — gag à un coup qui casserait
le déadpan en jeu de base ; envisageable uniquement comme easter egg ou
récompense de succès caché, la référence en étage bonus, jamais en plancher
(CLAUDE.md §3 et §6).

**Parqué (idées reprises du brutalisme terminal, adaptées à la peau SaaS)** :
trois patterns volés à un site outil-dev (fantasy-stack de wasp.sh), transposés
sans en garder l'habillage terminal (réservé aux développeurs — hors cible §3).
- Carte de partage en fin de run (V1) : image PNG générée côté client
  (« Dossier final : 12 / 45. NOUS AVONS REÇU DE TRÈS NOMBREUSES CANDIDATURES »),
  postable en un clic. Moteur viral naturel pour un jeu dont le test qualité est
  « un recruteur doit pouvoir le partager ». Le RNG seedé donne l'ID de run à
  mettre sur la carte (daily run gratuit).
- Panneau d'inspection au survol : survoler une carte / l'offre / le blind
  affiche ses « notes de dossier » dans un panneau latéral (le geste
  d'inspection de Papers Please). Peut enrichir la colonne d'activité existante.
- Le monospace comme voix de machine : l'ATS étant un logiciel, son écran de
  mort « CANDIDATURE NON RETENUE » en chasse fixe (froid, automatique) contre
  la Georgia du Recruteur = caractérisation gratuite par la typo. Candidat à
  entrer dès la tâche 2 (l'écran de mort de l'ATS est déjà au programme).

**Parqué (autre mode de jeu, hors slice — famille du duel async)** : l'entretien
de groupe (群面) — 10 candidats simulés, 1 poste, élimination en direct. Jouer
beaucoup = visible = désespéré (perd de l'Espoir) ; jouer trop peu = éliminé.
Mini-jeu de bluff. C'est un MODE (compétition directe), pas un blind.

## 15. Méthode de sourcing (pratique, pas une règle)

- Reddit / LinkedIn = **sonar** (repérer quelle absurdité est universellement
  reconnue), pas mine. Détecter le signal, puis revenir à la phrase réelle et
  l'extraire. Ne jamais copier la parodie déjà faite ni le fil amer (test du
  recruteur qui partage).
- Rejeter tout ce qui est **pub déguisée en indignation** (ex. « BizWhoo » : une
  boîte vend un outil en te faisant détester le RH). L'anti-modèle du ton.
- Les sorties d'outils externes (Design / Stitch / Studio) sont du **matériau à
  piller ponctuellement** (une palette, une dispo de main), jamais un écran
  copié tel quel. GAME_DESIGN.md reste l'autorité.
- **Regard externe (autre IA) sur brief OUVERT** : donner le concept nu + les
  contraintes dures, JAMAIS nos solutions (sinon il prolonge nos rails et
  renvoie notre reflet). S'il redécouvre nos idées → validation de solidité ;
  s'il apporte du neuf → souvent via l'angle culturel (une absurdité d'un autre
  marché qui rend visible une vérité universelle). Tout passe ensuite le même
  filtre : extraction fidèle, tendresse, candidat faillible jamais tricheur, pas
  de PV, pas de 3e ressource. À refaire avec d'autres modèles.
