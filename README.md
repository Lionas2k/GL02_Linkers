# GL02 LINKERS – Outil de Gestion des Examens au Format GIFT  
Projet GL02 – Sujet A – Ministère de l’Éducation de Sealand  

---

## 1. Présentation générale

GL02 Linkers est un outil en ligne de commande (CLI) permettant de gérer entièrement des examens au format **GIFT**, standard utilisé par Moodle.

Le logiciel prend en charge :

- Lecture et parsing de fichiers GIFT  
- Recherche et affichage des questions  
- Construction d’examens  
- Vérification de la qualité (doublons / format / quantité)  
- Simulation interactive d’un examen  
- Génération du bilan (score et détails)  
- Analyse statistique (profil + histogramme)  
- Comparaison de plusieurs examens  
- Génération de VCards conformes RFC 6350 & 6868  

Développé en **Node.js**, compatible Windows, Linux et macOS.

**Prérequis :**

- Node.js ≥ 14  
- npm ≥ 6  
- Git (optionnel)

---

## 2. Architecture générale

Architecture modulaire, claire et extensible :

```
┌─────────────────────────────────────────┐
│               Interface CLI             │
│   questions | exam | profile | teacher  │
└──────────────┬──────────────────────────┘
               │
    ┌──────────┼──────────┐
    │          │          │
┌───▼───┐   ┌──▼────┐   ┌──▼────┐
│Parser │   │Examens│   │Profil │
└───────┘   └────────┘   └────────┘
               │
         ┌─────▼──────┐
         │    VCard    │
         └─────────────┘
```

Flux général :  
**Fichier GIFT → Parser → Services (Exam/Profile) → CLI → Sorties (GIFT, JSON, VCF)**

---

## 3. Spécifications fonctionnelles (SPEC_1 à SPEC_9)

| SPEC | Fonctionnalité | Statut |
|------|----------------|--------|
| SPEC_1 | Rechercher / afficher une question | ✔ |
| SPEC_2 | Construire un examen | ✔ |
| SPEC_3 | Générer une VCard | ✔ |
| SPEC_4 | Simuler un examen | ✔ |
| SPEC_5 | Générer un bilan | ✔ |
| SPEC_6 | Vérifier la qualité d’un examen | ✔ |
| SPEC_7 | Générer un profil | ✔ |
| SPEC_8 | Histogramme ASCII | ✔ |
| SPEC_9 | Comparer deux examens | ✔ |

Toutes les SPEC sont entièrement implémentées.

---

## 4. Structure du projet

```
src/
├── cli/
│   ├── index.js              # Point d'entrée CLI
│   ├── questions.js          # SPEC_1
│   ├── exam.js               # SPEC_2, SPEC_4, SPEC_5, SPEC_6
│   ├── profile.js            # SPEC_7, SPEC_8, SPEC_9
│   └── teacher.js            # SPEC_3
│
├── parser/
│   └── GIFTParser.js         # Parsing du format GIFT
│
├── model/
│   ├── Question.js
│   └── CollectionQuestion.js
│
├── services/
│   ├── examService.js
│   ├── profileService.js
│   └── vcardService.js
│
tests/
├── parser.spec.js
├── exam.spec.js
├── profile.spec.js
├── collection.spec.js
└── integration.spec.js
```

---

## 5. Installation

```
git clone https://github.com/alexiszott/GL02_Linkers.git
cd GL02_Linkers
npm install
```

Vérification de l'installation :

```
node src/cli/index.js --help
```

---

## 6. Utilisation de la CLI

Toutes les commandes suivent la forme :
```
node src/cli/index.js <groupe> <commande> [options]
```

---

### ✔ A. Questions (SPEC_1)

**Lister les questions**
```
node src/cli/index.js questions list data/testQuestions.gift
```

**Afficher une question**
```
node src/cli/index.js questions show data/testQuestions.gift --id Q4
```

**Rechercher une question**
```
node src/cli/index.js questions search data/testQuestions.gift --keyword "capital"
```

---

### ✔ B. Examen (SPEC_2 & SPEC_6)

**Construire un examen**
```
node src/cli/index.js exam build data/testQuestions.gift --ids "Q1,Q2,Q3,Q4,Q5,Q6,Q7,Q8,Q9,Q10,Q11,Q12,Q13,Q14,Q15"
```

**Vérifier la qualité**
```
node src/cli/index.js exam check generatedExam.gift
```

---

### ✔ C. Simulation & Bilan (SPEC_4 & SPEC_5)

**Simuler un examen**
```
node src/cli/index.js exam simulate generatedExam.gift
```
→ génère automatiquement `generatedExam_responses.json`

**Générer un bilan**
```
node src/cli/index.js exam bilan generatedExam.gift generatedExam_responses.json
```

---

### ✔ D. Profil & Comparaison (SPEC_7 à SPEC_9)

**Afficher le profil**
```
node src/cli/index.js profile show data/testQuestions.gift
```

**Histogramme ASCII**
```
node src/cli/index.js profile histogram data/testQuestions.gift
```

**Comparer deux examens**


Pour permettre la comparaison entre deux examens, il est nécessaire de créer deux fichiers GIFT valides contenant chacun 15 à 20 questions, conformément aux spécifications.

- Créer un premier examen (Exam A)
```
node src/cli/index.js exam build data/testQuestions.gift --ids "Q1,Q2,Q3,Q4,Q5,Q6,Q7,Q8,Q9,Q10,Q11,Q12,Q13,Q14,Q15"
```


- Renommer le fichier généré :
```
ren generatedExam.gift examA.gift
```

- Créer un second examen (Exam B)

Il doit lui aussi contenir 15 questions uniques pour être valide :
```
node src/cli/index.js exam build data/testQuestions.gift --ids "Q6,Q7,Q8,Q9,Q10,Q11,Q12,Q13,Q14,Q15,Q16,Q17,Q18,Q19,Q20"
```

- Renommer le fichier :
```
ren generatedExam.gift examB.gift
```

- Comparer les deux examens
```
node src/cli/index.js profile compare examA.gift examB.gift
```
Cette commande affiche :

-Le score de similarité

-Les différences par type de question (MC, TF, MATCH, ESSAY…)

-Un résumé statistique clair et lisible 


---

### ✔ E. VCard (SPEC_3)

```
node src/cli/index.js teacher vcard --nom "Dupont" --prenom "Alice" --email "alice@utt.fr" --etablissement "UTT" --matiere "Informatique"
```

---

## 7. Tests (Jest)

Lancer tous les tests :

```
npm test
```

Lancer un test spécifique :

```
npx jest tests/parser.spec.js
```

Tests couverts :

- Parsing GIFT  
- CollectionQuestion  
- ExamService (build, check, simulate, bilan)  
- ProfileService  
- Pipeline d’intégration complet  

Tous les tests sont **validés**.

---

## 8. Contributeurs

| Nom | Modules |
|------|---------|
| **Alexis** | Parser GIFT, gestion des questions |
| **Othmane** | ExamService, Simulation, Bilan |
| **Enzo** | Profil, Histogramme, Comparaison |
| **Mouad** | CLI, VCard, Intégration, Documentation |

---

## 9. Modifications par rapport au cahier des charges  

### **9.1 Correction du format des questions**

CDC :

```
title "::" question-title "::" question-text
```

Format utilisé (standard GIFT Moodle) :

```
::question-id:: question-text
```

Motivations : conformité Moodle, réduction d’ambiguïtés, compatibilité accrue.

---

### **9.2 Détection automatique du type**

Ajout pour robustesse :

- Plusieurs mauvaises réponses → MC  
- TRUE/FALSE → TF  
- Paires → MATCH  
- Accolade vide → ESSAY  

Ne modifie aucune SPEC.

---

### **9.3 Génération automatique du fichier réponses**

Lors de :

```
exam simulate
```

Création automatique :

```
<exam>_responses.json
```

Facilite l’utilisation de `exam bilan`.

---

## 10. Bonnes pratiques Git  

### Branches

- `main` : stable (ne jamais pousser)
- `develop` : intégration
- branches perso :  
  `cli/mouad` • `parser/alexis` • `exam/othmane` • `profile/enzo`

### Workflow recommandé

```
git fetch --all
git checkout develop
git pull origin develop
git checkout <ma-branche>
git merge develop
```

### Règles

✔ Ne jamais pousser dans *main* ou *develop*  
✔ Toujours travailler sur une branche personnelle  
✔ Toujours créer une *Pull Request* vers *develop*  

---

## 11. Ressources utiles

- Format GIFT : https://docs.moodle.org/400/en/GIFT_format  
- RFC 6350 – vCard  
- RFC 6868 – Encodage vCard  
- Caporal.js documentation  
- Jest documentation  
