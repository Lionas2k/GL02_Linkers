/**
 * Module de commandes pour la gestion des examens
 * SPEC_2, SPEC_4, SPEC_5, SPEC_6 - Création, vérification, simulation et bilan d'examens
 * 
 * Intégration avec le module examens d'Othmane
 */

// Imports pour l'intégration avec les modules externes
// TODO: Vérifier les exports exacts et adapter les imports si nécessaire
const fs = require('fs');
const GIFTParser = require('../parser/GIFTParser');
const CollectionQuestion = require('../model/CollectionQuestion');
const ExamService = require('../services/examService');

/**
 * Documentation des points d'intégration avec ExamService
 * 
 * ExamService (classe) :
 *   - new ExamService() : Crée une instance du service
 *   - service.buildExam(questions, outputPath) : Construit un examen
 *     * Paramètres : questions (Array de Question), outputPath (string)
 *     * Retourne : CollectionQuestion
 *     * Lance une erreur si l'examen n'est pas valide (15-20 questions)
 *   - service.simulateExam(questions) : Simule un examen interactif
 *     * Paramètres : questions (Array de Question)
 *     * Retourne : Promise<Array> avec les réponses
 *   - service.checkExam(examFile) : Vérifie la qualité d'un examen
 *     * Paramètres : examFile (string) - chemin du fichier
 *     * Retourne : Object avec les résultats des vérifications
 *   - service.generateBilan(resultsFile, examFile, options) : Génère un bilan
 *     * Paramètres : resultsFile (string), examFile (string), options (Object)
 *     * Retourne : Object avec le bilan (score, erreurs, corrections)
 * 
 * Dépendances :
 *   - ExamService dépend du Parser GIFT pour charger les questions/examens
 *   - Utilise CollectionQuestion pour gérer les collections de questions
 * 
 * Workflow exam build :
 *   1. Charger le fichier source avec GIFTParser
 *   2. Sélectionner les questions (par IDs ou aléatoirement)
 *   3. Créer une instance ExamService
 *   4. Appeler service.buildExam(questions, outputPath)
 *   5. Gérer les erreurs (examen invalide, questions introuvables)
 * 
 * Workflow exam check :
 *   1. Créer une instance ExamService
 *   2. Appeler service.checkExam(examFile)
 *   3. Afficher les résultats (doublons, nombre questions, format)
 *   4. Mode --verbose : affichage détaillé
 * 
 * Workflow exam simulate :
 *   1. Charger l'examen avec GIFTParser
 *   2. Créer une instance ExamService
 *   3. Appeler await service.simulateExam(questions)
 *   4. Sauvegarder les réponses dans --output (JSON)
 * 
 * Workflow exam bilan :
 *   1. Charger le fichier de résultats (JSON)
 *   2. Charger l'examen original (si --exam fourni)
 *   3. Créer une instance ExamService
 *   4. Appeler service.generateBilan(resultsFile, examFile, options)
 *   5. Formater selon --format (text/json/html)
 */

/**
 * Fonctions helper pour le formatage des résultats
 */

/**
 * Formate les résultats de vérification d'examen
 * @param {Object} checkResults - Résultats de checkExam
 * @param {boolean} verbose - Mode verbose
 * @returns {string} - Résultats formatés
 */
function formatCheckResults(checkResults, verbose = false) {
  let output = '\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
  output += `Statut: ${checkResults.isValid ? '✅ VALIDE' : '❌ INVALIDE'}\n`;
  output += `Nombre de questions: ${checkResults.questionCount || 0}\n`;
  
  if (checkResults.duplicates && checkResults.duplicates.length > 0) {
    output += `⚠️  Doublons détectés: ${checkResults.duplicates.length}\n`;
  }
  
  if (verbose) {
    if (checkResults.errors && checkResults.errors.length > 0) {
      output += `\nErreurs:\n`;
      checkResults.errors.forEach(error => {
        output += `  ❌ ${error}\n`;
      });
    }
    
    if (checkResults.warnings && checkResults.warnings.length > 0) {
      output += `\nAvertissements:\n`;
      checkResults.warnings.forEach(warning => {
        output += `  ⚠️  ${warning}\n`;
      });
    }
    
    if (checkResults.duplicates && checkResults.duplicates.length > 0) {
      output += `\nDoublons:\n`;
      checkResults.duplicates.forEach(dup => {
        output += `  🔄 ${dup}\n`;
      });
    }
  }
  
  output += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  return output;
}

/**
 * Formate un bilan d'examen
 * @param {Object} bilan - Bilan généré
 * @param {string} format - Format de sortie (text, json, html)
 * @returns {string} - Bilan formaté
 */
function formatBilan(bilan, format = 'text') {
  if (format === 'json') {
    return JSON.stringify(bilan, null, 2);
  }
  
  if (format === 'html') {
    // Format HTML basique
    let html = '<!DOCTYPE html><html><head><title>Bilan Examen</title></head><body>';
    html += `<h1>Bilan de l'examen</h1>`;
    html += `<p><strong>Score:</strong> ${bilan.score}/${bilan.total} (${bilan.percentage}%)</p>`;
    if (bilan.errors && bilan.errors.length > 0) {
      html += `<h2>Erreurs</h2><ul>`;
      bilan.errors.forEach(error => {
        html += `<li>${error}</li>`;
      });
      html += `</ul>`;
    }
    html += '</body></html>';
    return html;
  }
  
  // Format text
  let output = '\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
  output += `📊 BILAN DE L'EXAMEN\n`;
  output += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
  output += `Score: ${bilan.score}/${bilan.total} (${bilan.percentage}%)\n\n`;
  
  if (bilan.errors && bilan.errors.length > 0) {
    output += `❌ Erreurs (${bilan.errors.length}):\n`;
    bilan.errors.forEach((error, index) => {
      output += `  ${index + 1}. ${error}\n`;
    });
    output += '\n';
  }
  
  if (bilan.corrections && bilan.corrections.length > 0) {
    output += `📝 Corrections:\n`;
    bilan.corrections.forEach((correction, index) => {
      output += `  ${index + 1}. ${correction}\n`;
    });
  }
  
  output += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  return output;
}

/**
 * Fonctions helper pour la gestion d'erreurs
 */

/**
 * Gère les erreurs de manière uniforme
 * @param {Error} error - Erreur à gérer
 * @param {string} context - Contexte de l'erreur (nom de la commande)
 */
function handleError(error, context) {
  console.error(`❌ Erreur dans ${context}: ${error.message}`);
  if (error.stack && process.env.DEBUG) {
    console.error(error.stack);
  }
  process.exit(1);
}

/**
 * Charge et parse un fichier GIFT
 * @param {string} filePath - Chemin du fichier GIFT
 * @returns {CollectionQuestion} - Collection de questions parsées
 */
function loadGIFTFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error(`Fichier introuvable: ${filePath}`);
    }
    
    const data = fs.readFileSync(filePath, 'utf8');
    const parser = new GIFTParser(false, false);
    parser.parse(data);
    
    const collection = new CollectionQuestion();
    if (parser.parsedQuestions && Array.isArray(parser.parsedQuestions)) {
      parser.parsedQuestions.forEach(question => {
        collection.addQuestion(question);
      });
    }
    
    return collection;
  } catch (error) {
    if (error.message.includes('introuvable')) {
      throw error;
    }
    throw new Error(`Erreur lors du parsing du fichier GIFT: ${error.message}`);
  }
}

/**
 * Sélectionne des questions selon les critères
 * @param {CollectionQuestion} collection - Collection de questions
 * @param {string} questionIds - Liste d'IDs séparés par virgules (optionnel)
 * @param {boolean} random - Sélection aléatoire
 * @param {number} count - Nombre de questions si random
 * @returns {Array} - Liste de questions sélectionnées
 */
function selectQuestions(collection, questionIds, random, count) {
  const allQuestions = collection.getAll();
  
  if (questionIds) {
    // Sélection par IDs
    const ids = questionIds.split(',').map(id => id.trim());
    const selected = [];
    const notFound = [];
    
    ids.forEach(id => {
      const question = allQuestions.find(q => q.id && q.id.toLowerCase() === id.toLowerCase());
      if (question) {
        selected.push(question);
      } else {
        notFound.push(id);
      }
    });
    
    if (notFound.length > 0) {
      throw new Error(`Questions introuvables: ${notFound.join(', ')}`);
    }
    
    return selected;
  }
  
  if (random) {
    // Sélection aléatoire
    const numQuestions = count || Math.min(20, allQuestions.length);
    if (numQuestions > allQuestions.length) {
      throw new Error(`Pas assez de questions disponibles (${allQuestions.length} disponibles, ${numQuestions} demandées)`);
    }
    
    const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, numQuestions);
  }
  
  return allQuestions;
}

/**
 * Enregistre les commandes du groupe "exam"
 * @param {Object} program - Instance Caporal program
 */
function registerExamCommands(program) {
  // Groupe principal "exam"
  program
    .command('exam', 'Gérer les examens');

  // Commande: exam build
  program
    .command('exam build', 'Créer un examen en format GIFT')
    .argument('<output>', 'Chemin du fichier GIFT de sortie')
    .option('--questions <ids>', 'Liste d\'IDs de questions séparés par des virgules (ex: Q001,Q002,Q003)', {
      validator: program.STRING
    })
    .option('--file <file>', 'Fichier source de questions', {
      default: 'questions.gift',
      validator: program.STRING
    })
    .option('--title <title>', 'Titre de l\'examen', {
      validator: program.STRING
    })
    .option('--random', 'Sélection aléatoire de questions si --questions non spécifié', {
      flag: true
    })
    .option('--count <number>', 'Nombre de questions si --random activé', {
      validator: program.NUMBER
    })
    .action(({ args, options }) => {
      try {
        // Charger le fichier source
        const collection = loadGIFTFile(options.file);
        
        // Sélectionner les questions
        if (!options.questions && !options.random) {
          throw new Error('Spécifiez --questions ou --random');
        }
        
        const selectedQuestions = selectQuestions(
          collection,
          options.questions,
          options.random,
          options.count
        );
        
        // Créer l'examen
        const examService = new ExamService();
        examService.buildExam(selectedQuestions, args.output, { title: options.title });
        
        console.log(`✅ Examen créé avec succès: ${args.output}`);
        console.log(`   Nombre de questions: ${selectedQuestions.length}`);
      } catch (error) {
        handleError(error, 'exam build');
      }
    });

  // Commande: exam check
  program
    .command('exam check', 'Vérifier la qualité d\'un examen')
    .argument('<file>', 'Fichier examen GIFT à vérifier')
    .option('--verbose', 'Affichage détaillé des vérifications', {
      flag: true
    })
    .action(({ args, options }) => {
      try {
        const examService = new ExamService();
        const checkResults = examService.checkExam(args.file);
        
        console.log(formatCheckResults(checkResults, options.verbose));
        
        process.exit(checkResults.isValid ? 0 : 1);
      } catch (error) {
        handleError(error, 'exam check');
      }
    });

  // Commande: exam simulate
  program
    .command('exam simulate', 'Simuler la passation d\'un examen')
    .argument('<file>', 'Fichier examen GIFT à simuler')
    .option('--output <file>', 'Fichier pour sauvegarder les réponses', {
      validator: program.STRING
    })
    .option('--time-limit <minutes>', 'Limite de temps en minutes', {
      validator: program.NUMBER
    })
    .action(async ({ args, options }) => {
      try {
        // Charger l'examen
        const collection = loadGIFTFile(args.file);
        const questions = collection.getAll();
        
        // Simuler l'examen
        const examService = new ExamService();
        const answers = await examService.simulateExam(questions, { timeLimit: options.timeLimit });
        
        // Sauvegarder les résultats
        const outputFile = options.output || `exam_results_${Date.now()}.json`;
        const results = {
          examFile: args.file,
          timestamp: new Date().toISOString(),
          answers: answers,
          totalScore: answers.reduce((sum, a) => sum + (a.points || 0), 0),
          totalPossible: answers.reduce((sum, a) => sum + (a.maxPoints || 1), 0)
        };
        results.percentage = ((results.totalScore / results.totalPossible) * 100).toFixed(2);
        
        fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));
        
        console.log(`✅ Simulation terminée. Score: ${results.totalScore}/${results.totalPossible} (${results.percentage}%)`);
        console.log(`   Réponses sauvegardées: ${outputFile}`);
      } catch (error) {
        handleError(error, 'exam simulate');
      }
    });

  // Commande: exam bilan
  program
    .command('exam bilan', 'Générer un bilan du test')
    .argument('<results-file>', 'Fichier de résultats du test')
    .option('--exam <exam-file>', 'Fichier examen original (obligatoire pour corrections)', {
      validator: program.STRING
    })
    .option('--format <format>', 'Format de sortie (text, json, html)', {
      default: 'text',
      validator: ['text', 'json', 'html']
    })
    .option('--output <file>', 'Fichier de sortie pour le bilan', {
      validator: program.STRING
    })
    .action(({ args, options }) => {
      try {
        // Charger le fichier de résultats
        if (!fs.existsSync(args.resultsFile)) {
          throw new Error(`Fichier de résultats introuvable: ${args.resultsFile}`);
        }
        
        const resultsData = JSON.parse(fs.readFileSync(args.resultsFile, 'utf8'));
        
        // Générer le bilan
        const examService = new ExamService();
        const bilan = examService.generateBilan(args.resultsFile, options.exam, { format: options.format });
        
        // Formater et afficher/sauvegarder
        const formatted = formatBilan(bilan, options.format);
        
        if (options.output) {
          fs.writeFileSync(options.output, formatted);
          console.log(`✅ Bilan sauvegardé: ${options.output}`);
        } else {
          console.log(formatted);
        }
      } catch (error) {
        handleError(error, 'exam bilan');
      }
    });
}

module.exports = registerExamCommands;
