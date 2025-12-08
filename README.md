# GL02 Linkers - Gestion des Examens

Outil en ligne de commande pour la gestion des examens au format GIFT (Moodle) développé pour le ministère de l'Éducation de Sealand.

## 📋 Table des matières

1. [Description](#description)
2. [Objectifs du logiciel](#objectifs-du-logiciel)
3. [Architecture générale](#architecture-générale)
4. [Prérequis](#prérequis)
5. [Installation](#installation)
6. [Lancement de la CLI](#lancement-de-la-cli)
7. [Commandes](#commandes)
8. [Exemples d'utilisation](#exemples-dutilisation)
9. [Structure du projet](#structure-du-projet)
10. [Format VCard (SPEC_3)](#format-vcard-spec_3)
11. [Intégration future](#intégration-future)
12. [Bonnes pratiques Git](#bonnes-pratiques-git)
13. [Limitations actuelles](#limitations-actuelles)
14. [Contributeurs](#contributeurs)
15. [Licence](#licence)

---

## 🎯 Description

GL02 Linkers est un outil CLI (Command Line Interface) permettant de gérer complètement le cycle de vie des examens au format GIFT, le format standard utilisé par Moodle.

### Caractéristiques principales

- **100% en ligne de commande** : Aucune interface graphique, utilisation entièrement via le terminal
- **Multi-plateforme** : Compatible Windows, Linux et macOS
- **Format GIFT** : Compatible avec le format standard Moodle
- **Génération VCard** : Création de cartes de contact enseignants conformes aux normes RFC
- **Analyse statistique** : Profils, histogrammes et comparaison d'examens
- **Simulation d'examens** : Mode interactif pour tester les examens

### Public cible

- **Enseignants** : Création, vérification et analyse d'examens
- **Étudiants** : Simulation et consultation des résultats
- **Administrateurs** : Gestion de banques de questions

---

## 🎯 Objectifs du logiciel

Le logiciel GL02 Linkers permet de :

1. **Lire et analyser** des fichiers d'examens au format GIFT (standard Moodle)
2. **Créer des examens** à partir de questions sélectionnées
3. **Simuler un test** comme un étudiant
4. **Générer des VCard** d'enseignants (RFC 6350 & 6868)
5. **Analyser statistiquement** les questions
6. **Comparer des examens** entre eux
7. **Produire des histogrammes** textuels

---

## 🏗️ Architecture générale

GL02 Linkers est organisé en modules indépendants :

```
┌─────────────────────────────────────────┐
│         Interface CLI (Mouad)           │
│  questions | exam | profile | teacher   │
└──────────────┬──────────────────────────┘
               │
    ┌──────────┼──────────┐
    │          │          │
┌───▼───┐ ┌───▼───┐ ┌───▼───┐
│Parser │ │Examens│ │Profil │
│Alexis │ │Othmane│ │ Enzo  │
└───────┘ └───────┘ └───────┘
    │
┌───▼────────┐
│  VCard    │
│  (Mouad)  │
└───────────┘
```

### Spécifications couvertes

| SPEC | Fonctionnalité | Statut |
|------|----------------|--------|
| SPEC_1 | Rechercher et visualiser une question | ⏳ En attente parser |
| SPEC_2 | Créer un examen en format GIFT | ⏳ En attente module examens |
| SPEC_3 | Générer une VCard enseignant | ✅ **Implémenté** |
| SPEC_4 | Simuler la passation d'un examen | ⏳ En attente module examens |
| SPEC_5 | Générer un bilan du test | ⏳ En attente module examens |
| SPEC_6 | Vérifier la qualité d'un examen | ⏳ En attente module examens |
| SPEC_7 | Générer un profil d'examen | ⏳ En attente module profil |
| SPEC_8 | Visualiser un histogramme | ⏳ En attente module profil |
| SPEC_9 | Comparer deux examens | ⏳ En attente module profil |

---

## 📦 Prérequis

### Logiciels requis

- **Node.js** : Version 14.0.0 ou supérieure
- **npm** : Généralement inclus avec Node.js (version 6.0.0 ou supérieure)
- **Git** : Pour cloner le repository (optionnel)

### Vérification des prérequis

```bash
node --version
npm --version
```

### Dépendances du projet

- **@caporal/core** : Framework CLI (déjà dans package.json)
- **Node.js standard library** : fs, path, etc.

---

## 🚀 Installation

### Étape 1 : Cloner le repository

```bash
git clone https://github.com/alexiszott/GL02_Linkers.git
cd GL02_Linkers
```

### Étape 2 : Installer les dépendances

```bash
npm install
```

Cette commande installe toutes les dépendances nécessaires, notamment `@caporal/core`.

### Étape 3 : Vérifier l'installation

```bash
node src/cli/index.js --version
```

Vous devriez voir : `1.0.0`

### Optionnel : Installation globale

Pour utiliser `gl02-linkers` depuis n'importe quel répertoire :

```bash
npm link
```

Après cette étape, vous pourrez utiliser `gl02-linkers` directement.

---

## 💻 Lancement de la CLI

### Méthode 1 : Depuis le répertoire du projet

```bash
node src/cli/index.js <commande> [options]
```

### Méthode 2 : Si installé globalement

```bash
gl02-linkers <commande> [options]
```

### Méthode 3 : Via npm script

```bash
npm start <commande> [options]
```

### Obtenir de l'aide

```bash
# Aide globale
node src/cli/index.js --help

# Aide pour un groupe de commandes
node src/cli/index.js questions --help

# Aide pour une commande spécifique
node src/cli/index.js questions search --help
```

### Structure générale des commandes

```
gl02-linkers <groupe> <commande> [arguments] [options]
```

Exemple :
```bash
gl02-linkers questions search "mathématiques" --type MCQ
```

---

## 📚 Commandes

### 🔍 Questions (SPEC_1)

#### `questions search` - Rechercher une question

Recherche des questions par mot-clé, ID ou type.

**Syntaxe :**
```bash
gl02-linkers questions search <keyword> [options]
```

**Arguments :**
- `<keyword>` (obligatoire) : Mot-clé, ID ou type de question à rechercher

**Options :**
- `--type <type>` : Filtrer par type de question (MCQ, TF, NUMERIC, MATCH, SHORTANSWER)
- `--file <file>` : Fichier GIFT source à analyser (défaut: `questions.gift`)
- `--format <format>` : Format de sortie (text, json) (défaut: `text`)

**Exemples :**
```bash
# Recherche par mot-clé
gl02-linkers questions search "mathématiques"

# Recherche par type
gl02-linkers questions search "QCM" --type MCQ

# Recherche avec fichier spécifique
gl02-linkers questions search "algèbre" --file mes_questions.gift

# Format JSON
gl02-linkers questions search "test" --format json
```

**État actuel :** ⏳ En attente du parser GIFT d'Alexis

---

#### `questions show` - Afficher une question en détail

Affiche une question complète avec tous ses détails.

**Syntaxe :**
```bash
gl02-linkers questions show <id> [options]
```

**Arguments :**
- `<id>` (obligatoire) : ID unique de la question à afficher

**Options :**
- `--file <file>` : Fichier GIFT source à analyser (défaut: `questions.gift`)
- `--format <format>` : Format d'affichage (detailed, compact) (défaut: `detailed`)

**Exemples :**
```bash
gl02-linkers questions show Q001
gl02-linkers questions show Q042 --file examen_final.gift
gl02-linkers questions show Q015 --format compact
```

**État actuel :** ⏳ En attente du parser GIFT d'Alexis

---

### 📝 Exam (SPEC_2, SPEC_4, SPEC_5, SPEC_6)

#### `exam build` - Créer un examen en format GIFT

Crée un examen GIFT à partir de questions sélectionnées.

**Syntaxe :**
```bash
gl02-linkers exam build <output> [options]
```

**Arguments :**
- `<output>` (obligatoire) : Chemin du fichier GIFT de sortie

**Options :**
- `--questions <ids>` : Liste d'IDs de questions séparés par des virgules (ex: Q001,Q002,Q003)
- `--file <file>` : Fichier source de questions (défaut: `questions.gift`)
- `--title <title>` : Titre de l'examen
- `--random` : Sélection aléatoire de questions si --questions non spécifié
- `--count <number>` : Nombre de questions si --random activé

**Exemples :**
```bash
# Créer un examen avec des questions spécifiques
gl02-linkers exam build examen_final.gift --questions Q001,Q002,Q003

# Créer un examen aléatoire
gl02-linkers exam build test.gift --file questions.gift --random --count 20

# Créer un examen avec titre
gl02-linkers exam build examen.gift --title "Examen Final 2024" --questions Q001,Q002
```

**État actuel :** ⏳ En attente du module examens d'Othmane

---

#### `exam check` - Vérifier la qualité d'un examen

Vérifie qu'un examen respecte les critères de qualité.

**Syntaxe :**
```bash
gl02-linkers exam check <file> [options]
```

**Arguments :**
- `<file>` (obligatoire) : Fichier examen GIFT à vérifier

**Options :**
- `--verbose` : Affichage détaillé des vérifications

**Vérifications effectuées :**
- ✅ Absence de doublons
- ✅ Nombre de questions entre 15 et 20
- ✅ Format GIFT valide

**Exemples :**
```bash
gl02-linkers exam check examen_final.gift
gl02-linkers exam check test.gift --verbose
```

**État actuel :** ⏳ En attente du module examens d'Othmane

---

#### `exam simulate` - Simuler la passation d'un examen

Simule la passation d'un examen de manière interactive.

**Syntaxe :**
```bash
gl02-linkers exam simulate <file> [options]
```

**Arguments :**
- `<file>` (obligatoire) : Fichier examen GIFT à simuler

**Options :**
- `--output <file>` : Fichier pour sauvegarder les réponses
- `--time-limit <minutes>` : Limite de temps en minutes

**Exemples :**
```bash
gl02-linkers exam simulate examen_final.gift
gl02-linkers exam simulate test.gift --output mes_reponses.json
gl02-linkers exam simulate examen.gift --time-limit 60
```

**État actuel :** ⏳ En attente du module examens d'Othmane

---

#### `exam bilan` - Générer un bilan du test

Génère un bilan détaillé d'un test passé.

**Syntaxe :**
```bash
gl02-linkers exam bilan <results-file> [options]
```

**Arguments :**
- `<results-file>` (obligatoire) : Fichier de résultats du test

**Options :**
- `--exam <exam-file>` : Fichier examen original (obligatoire pour corrections)
- `--format <format>` : Format de sortie (text, json, html) (défaut: `text`)
- `--output <file>` : Fichier de sortie pour le bilan

**Contenu du bilan :**
- Score obtenu
- Pourcentage de réussite
- Liste des erreurs
- Corrections détaillées (si --exam fourni)

**Exemples :**
```bash
gl02-linkers exam bilan mes_reponses.json --exam examen_final.gift
gl02-linkers exam bilan results.json --format json --output bilan.json
gl02-linkers exam bilan test_results.json --exam test.gift --format html
```

**État actuel :** ⏳ En attente du module examens d'Othmane

---

### 📊 Profile (SPEC_7, SPEC_8, SPEC_9)

#### `profile show` - Générer un profil d'examen

Génère un profil statistique d'un examen.

**Syntaxe :**
```bash
gl02-linkers profile show <file> [options]
```

**Arguments :**
- `<file>` (obligatoire) : Fichier examen GIFT à analyser

**Options :**
- `--format <format>` : Format de sortie (text, json) (défaut: `text`)

**Informations affichées :**
- Total de questions
- Comptage par type (QCM, Vrai/Faux, Numériques, Matching, etc.)
- Répartition en pourcentage

**Exemples :**
```bash
gl02-linkers profile show examen_final.gift
gl02-linkers profile show test.gift --format json
```

**État actuel :** ⏳ En attente du module profil d'Enzo

---

#### `profile histogram` - Visualiser un histogramme ASCII

Génère un histogramme ASCII de la répartition des questions.

**Syntaxe :**
```bash
gl02-linkers profile histogram <file> [options]
```

**Arguments :**
- `<file>` (obligatoire) : Fichier examen GIFT à analyser

**Options :**
- `--width <number>` : Largeur maximale de l'histogramme (défaut: 50)
- `--sort <order>` : Tri (count, type, name) (défaut: `count`)

**Exemple de sortie :**
```
MCQ    ███████ 12
TF     ██ 2
MATCH  █ 1
NUM    ███ 3
```

**Exemples :**
```bash
gl02-linkers profile histogram examen_final.gift
gl02-linkers profile histogram test.gift --width 30
gl02-linkers profile histogram examen.gift --sort type
```

**État actuel :** ⏳ En attente du module profil d'Enzo

---

#### `profile compare` - Comparer deux examens

Compare deux examens et calcule leur similarité.

**Syntaxe :**
```bash
gl02-linkers profile compare <file1> <file2> [options]
```

**Arguments :**
- `<file1>` (obligatoire) : Premier fichier examen
- `<file2>` (obligatoire) : Deuxième fichier examen

**Options :**
- `--format <format>` : Format de sortie (text, json) (défaut: `text`)
- `--detailed` : Affichage détaillé des différences

**Informations affichées :**
- Score de similarité global
- Différences par type de question
- Tableau comparatif

**Exemples :**
```bash
gl02-linkers profile compare examen_2023.gift examen_2024.gift
gl02-linkers profile compare test1.gift test2.gift --detailed
gl02-linkers profile compare examen_A.gift examen_B.gift --format json
```

**État actuel :** ⏳ En attente du module profil d'Enzo

---

### 🧑‍🏫 Teacher (SPEC_3)

#### `teacher vcard` - Générer une VCard enseignant

Génère une VCard d'enseignant conforme aux normes RFC 6350 & RFC 6868.

**Syntaxe :**
```bash
gl02-linkers teacher vcard [options]
```

**Options (toutes requises sauf --output) :**
- `--nom <nom>` (requis) : Nom de l'enseignant
- `--prenom <prenom>` (requis) : Prénom de l'enseignant
- `--email <email>` (requis) : Email de l'enseignant
- `--etablissement <etablissement>` (requis) : Établissement
- `--matiere <matiere>` (requis) : Matière enseignée
- `--output <file>` (optionnel) : Fichier de sortie (.vcf) (défaut: `teacher.vcf`)

**Exemples :**
```bash
gl02-linkers teacher vcard \
  --nom "Dupont" \
  --prenom "Jean" \
  --email "jean.dupont@education.sealand" \
  --etablissement "Lycée Central" \
  --matiere "Mathématiques"

gl02-linkers teacher vcard \
  --nom "Martin" \
  --prenom "Marie" \
  --email "marie.martin@school.fr" \
  --etablissement "Collège Victor Hugo" \
  --matiere "Français" \
  --output marie_martin.vcf
```

**État actuel :** ✅ **Complètement implémenté et fonctionnel**

---

## 💡 Exemples d'utilisation

### Scénario 1 : Enseignant créant un examen

```bash
# 1. Rechercher des questions
gl02-linkers questions search "mathématiques"

# 2. Vérifier une question
gl02-linkers questions show Q001

# 3. Créer l'examen
gl02-linkers exam build examen_final.gift --questions Q001,Q002,Q003

# 4. Vérifier la qualité
gl02-linkers exam check examen_final.gift

# 5. Analyser le profil
gl02-linkers profile show examen_final.gift

# 6. Visualiser l'histogramme
gl02-linkers profile histogram examen_final.gift
```

### Scénario 2 : Étudiant passant un examen

```bash
# 1. Simuler l'examen
gl02-linkers exam simulate examen_final.gift --output mes_reponses.json

# 2. Voir le bilan
gl02-linkers exam bilan mes_reponses.json --exam examen_final.gift
```

### Scénario 3 : Enseignant analysant des examens

```bash
# 1. Voir le profil d'un examen
gl02-linkers profile show examen_2023.gift

# 2. Comparer deux examens
gl02-linkers profile compare examen_2023.gift examen_2024.gift --detailed
```

### Scénario 4 : Génération VCard

```bash
# Générer sa carte de contact
gl02-linkers teacher vcard \
  --nom "Dupont" \
  --prenom "Jean" \
  --email "jean.dupont@education.sealand" \
  --etablissement "Lycée Central" \
  --matiere "Mathématiques" \
  --output jean_dupont.vcf
```

---

## 📁 Structure du projet

```
GL02_Linkers/
├── src/
│   ├── cli/              ← Interface CLI (Mouad)
│   │   ├── index.js      ← Point d'entrée principal
│   │   ├── questions.js  ← Commandes questions (SPEC_1)
│   │   ├── exam.js       ← Commandes examens (SPEC_2, 4, 5, 6)
│   │   ├── profile.js    ← Commandes profil (SPEC_7, 8, 9)
│   │   └── teacher.js    ← Commandes enseignant (SPEC_3)
│   ├── services/         ← Services métier
│   │   └── vcardService.js ← Service VCard (Mouad - SPEC_3)
│   ├── parser/           ← Parser GIFT (Alexis)
│   ├── exam/             ← Module examens (Othmane)
│   └── profile/          ← Module profil (Enzo)
├── tests/
│   └── cli/              ← Tests unitaires (à venir)
├── package.json
├── package-lock.json
└── README.md
```

### Responsabilités par module

| Module | Responsable | Fonctionnalités |
|-------|-------------|-----------------|
| **CLI** | Mouad | Interface utilisateur, commandes, gestion des erreurs |
| **VCard** | Mouad | Génération de VCard conforme RFC 6350 & 6868 |
| **Parser GIFT** | Alexis | Lecture et parsing des fichiers GIFT |
| **Gestion des questions** | Alexis | Recherche, affichage des questions |
| **CollectionQuestion** | Othmane | Structure de données pour les questions |
| **Construction examen** | Othmane | Création d'examens, vérification qualité |
| **Simulation/Bilan** | Othmane | Simulation de test, génération de bilans |
| **Profil/Histogramme** | Enzo | Analyse statistique, comparaison d'examens |

---

## 📄 Format VCard (SPEC_3)

### Qu'est-ce qu'une VCard ?

Une VCard (Virtual Contact File) est un format standardisé pour échanger des informations de contact. Les VCard générées par GL02 Linkers sont conformes aux normes **RFC 6350** et **RFC 6868**.

### Champs générés

Chaque VCard contient les champs suivants :

- **BEGIN:VCARD** / **END:VCARD** : Délimiteurs de la VCard
- **VERSION:3.0** : Version du format VCard
- **FN** : Nom complet (Prénom Nom)
- **N** : Nom structuré (Nom;Prénom;;;)
- **EMAIL;TYPE=INTERNET** : Adresse email
- **ORG** : Établissement
- **CATEGORIES** : Matière enseignée
- **REV** : Date de révision (format ISO 8601)

### Exemple de VCard générée

```
BEGIN:VCARD
VERSION:3.0
FN:Jean Dupont
N:Dupont;Jean;;;
EMAIL;TYPE=INTERNET:jean.dupont@education.sealand
ORG:Lycée Central
CATEGORIES:Mathématiques
REV:20241203T120000Z
END:VCARD
```

### Gestion des caractères spéciaux (RFC 6868)

Le module VCard gère automatiquement l'échappement des caractères spéciaux :

- `^n` : Nouvelle ligne
- `^^` : Caractère caret (^)
- `^'` : Apostrophe
- `\,` : Virgule
- `\;` : Point-virgule
- `\\` : Backslash
- `\ ` : Espaces en début/fin de ligne

### Compatibilité

Les VCard générées sont compatibles avec :
- ✅ Outlook (Windows)
- ✅ Google Contacts
- ✅ Apple Contacts (macOS/iOS)
- ✅ Thunderbird
- ✅ Toute application supportant VCard 3.0

### Validation

Les fichiers `.vcf` générés peuvent être validés avec des outils en ligne et sont directement importables dans les applications de contacts.

---

## 🔗 Intégration future

### Architecture modulaire

GL02 Linkers est conçu de manière modulaire pour permettre l'intégration progressive des différents modules.

### Module Parser GIFT (Alexis)

**Rôle :** Parser et gestion des fichiers GIFT

**Utilisé par :**
- `questions search` et `questions show`
- `exam build` et `exam check`
- `profile show`, `profile histogram`, `profile compare`

**Fonctions attendues :**
- `parseGIFT(filePath)` : Parse un fichier GIFT
- `searchQuestion(keyword, type)` : Recherche des questions
- `getQuestionById(id)` : Récupère une question par ID

**État :** ⏳ En développement par Alexis

---

### Module Examens (Othmane)

**Rôle :** Gestion complète des examens

**Utilisé par :**
- `exam build` : Construction d'examens
- `exam check` : Vérification qualité
- `exam simulate` : Simulation interactive
- `exam bilan` : Génération de bilans

**Fonctions attendues :**
- `buildExam(questions, outputPath, options)` : Construit un examen
- `checkExam(examFile)` : Vérifie la qualité
- `simulateExam(examFile, options)` : Simule un examen
- `generateBilan(resultsFile, examFile, options)` : Génère un bilan

**État :** ⏳ En développement par Othmane

---

### Module Profil (Enzo)

**Rôle :** Analyse statistique des examens

**Utilisé par :**
- `profile show` : Génération de profil
- `profile histogram` : Histogramme ASCII
- `profile compare` : Comparaison d'examens

**Fonctions attendues :**
- `generateProfile(examFile)` : Génère un profil
- `generateHistogram(examFile, options)` : Génère un histogramme
- `compareExams(examFile1, examFile2, options)` : Compare deux examens

**État :** ⏳ En développement par Enzo

---

### Module VCard (Mouad)

**Rôle :** Génération de VCard conforme RFC

**Utilisé par :**
- `teacher vcard` : Génération de VCard

**Fonctions :**
- `generateVCard(data, outputFile)` : Génère une VCard
- `escapeVCardText(text)` : Échappe les caractères spéciaux
- `validateVCardData(data)` : Valide les données

**État :** ✅ **Complètement implémenté et fonctionnel**

---

## 🔄 Bonnes pratiques Git

### Structure des branches

- **`main`** : Version stable (ne jamais modifier directement)
- **`develop`** : Version en cours d'intégration
- **Branches personnelles** :
  - `cli/mouad` : CLI, VCard, Documentation, Intégration
  - `parser/alexis` : Parser GIFT
  - `exam/othmane` : Module examens
  - `profile/enzo` : Module profil

### Workflow Git

#### Au début de chaque session

```bash
# 1. Récupérer les dernières modifications
git fetch --all

# 2. Mettre à jour develop
git checkout develop
git pull origin develop

# 3. Retourner sur votre branche
git checkout cli/mouad

# 4. Fusionner develop dans votre branche
git merge develop
```

#### Pendant le travail

```bash
# Vérifier que vous êtes sur la bonne branche
git branch --show-current  # Doit afficher: cli/mouad

# Faire des commits réguliers
git add src/cli/ src/services/
git commit -m "Description claire des modifications"
```

#### Pour pousser

```bash
# Pousser uniquement dans votre branche
git push origin cli/mouad
```

#### Pour créer une Pull Request

1. Aller sur GitHub
2. Créer une Pull Request : `cli/mouad` → `develop`
3. Remplir le titre et la description
4. Attendre la review d'un autre membre

### Règles importantes

- ❌ **Ne jamais** commiter directement sur `main` ou `develop`
- ❌ **Ne jamais** pousser directement dans `main` ou `develop`
- ✅ **Toujours** travailler sur votre branche personnelle
- ✅ **Toujours** passer par une Pull Request pour intégrer dans `develop`
- ✅ **Toujours** synchroniser avec `develop` avant de créer une PR

### Messages de commit

**Format recommandé :**
```
Verbe à l'impératif + description

Exemples :
- "Création de la structure CLI avec Caporal.js"
- "Implémentation du module VCard (SPEC_3)"
- "Ajout des stubs pour les commandes questions"
- "Correction de la validation des champs vides"
```

---

## ⚠️ Limitations actuelles

### État actuel du projet

| Fonctionnalité | Statut | Détails |
|----------------|--------|---------|
| **CLI complète** | ✅ | Toutes les commandes enregistrées et fonctionnelles |
| **VCard (SPEC_3)** | ✅ | Complètement implémentée et testée |
| **Questions (SPEC_1)** | ⏳ | Stubs prêts, en attente du parser d'Alexis |
| **Examens (SPEC_2, 4, 5, 6)** | ⏳ | Stubs prêts, en attente du module d'Othmane |
| **Profil (SPEC_7, 8, 9)** | ⏳ | Stubs prêts, en attente du module d'Enzo |

### Fonctionnalités en attente

Les commandes suivantes affichent actuellement des placeholders indiquant qu'elles sont en attente des modules correspondants :

- `questions search` et `questions show` : En attente du parser GIFT
- `exam build`, `exam check`, `exam simulate`, `exam bilan` : En attente du module examens
- `profile show`, `profile histogram`, `profile compare` : En attente du module profil

### Intégration future

Une fois que les autres membres de l'équipe auront terminé leurs modules, l'intégration se fera en :
1. Décommentant les imports dans les fichiers CLI
2. Remplaçant les placeholders par les appels aux fonctions réelles
3. Testant les workflows complets

---

## 👥 Contributeurs

- **Mouad** : CLI, VCard (SPEC_3), Documentation, Intégration
- **Alexis** : Parser GIFT, Gestion des questions
- **Othmane** : CollectionQuestion, Construction examen, Simulation/Bilan
- **Enzo** : Profil, Histogramme, Comparaison

---

## 📄 Licence

ISC

---

## 🐛 Signaler un problème

Si vous rencontrez un problème, veuillez ouvrir une issue sur le dépôt GitHub :
https://github.com/alexiszott/GL02_Linkers/issues

---

## 📚 Ressources

- [Documentation GIFT (Moodle)](https://docs.moodle.org/400/en/GIFT_format)
- [RFC 6350 - vCard Format Specification](https://tools.ietf.org/html/rfc6350)
- [RFC 6868 - Parameter Value Encoding in iCalendar and vCard](https://tools.ietf.org/html/rfc6868)
- [Documentation Caporal.js](https://github.com/mattallty/caporal.js)

