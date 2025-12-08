/**
 * Module de commandes pour la gestion des examens
 * SPEC_2, SPEC_4, SPEC_5, SPEC_6 - Création, vérification, simulation et bilan d'examens
 * 
 * Intégration avec le module ExamService d'Othmane
 */

const fs = require('fs');
const GIFTParser = require('../parser/GIFTParser');
const CollectionQuestion = require('../model/CollectionQuestion');
const ExamService = require('../services/examService');

/**
 * Charge et parse un fichier GIFT
 * @param {string} filePath - Chemin du fichier GIFT
 * @returns {Array} - Liste de questions parsées
 */
function loadGIFTQuestions(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Fichier introuvable: ${filePath}`);
  }
  
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    const parser = new GIFTParser(false, false);
    parser.parse(data);
    
    return parser.parsedQuestions || [];
  } catch (error) {
    throw new Error(`Erreur lors du parsing du fichier GIFT: ${error.message}`);
  }
}

/**
 * Filtre les questions selon une liste d'IDs
 * @param {Array} questions - Liste de questions
 * @param {string} idsString - Liste d'IDs séparés par virgules (ex: "1,2,4,5")
 * @returns {Array} - Questions filtrées
 */
function filterQuestionsByIds(questions, idsString) {
  const ids = idsString.split(',').map(id => id.trim());
  const filtered = [];
  const notFound = [];
  
  ids.forEach(id => {
    const question = questions.find(q => {
      const qId = String(q.id || '').trim();
      return qId === id || qId.toLowerCase() === id.toLowerCase();
    });
    
    if (question) {
      filtered.push(question);
    } else {
      notFound.push(id);
    }
  });
  
  if (notFound.length > 0) {
    throw new Error(`Questions introuvables: ${notFound.join(', ')}`);
  }
  
  return filtered;
}

/**
 * Formate les résultats de vérification
 * @param {Object} checkResults - Résultats de checkExam
 * @returns {string} - Résultats formatés
 */
function formatCheckResults(checkResults) {
  if (checkResults.isValid) {
    return `✅ Examen valide\n   Nombre de questions: ${checkResults.questionCount || 0}`;
  }
  
  let output = `❌ Examen invalide\n`;
  output += `   Nombre de questions: ${checkResults.questionCount || 0}\n`;
  
  if (checkResults.errors && checkResults.errors.length > 0) {
    output += `\n   Erreurs:\n`;
    checkResults.errors.forEach(error => {
      output += `     - ${error}\n`;
    });
  }
  
  if (checkResults.duplicates && checkResults.duplicates.length > 0) {
    output += `\n   Doublons détectés: ${checkResults.duplicates.length}\n`;
  }
  
  return output;
}

/**
 * Formate le bilan d'examen
 * @param {Object} bilan - Bilan généré par analyzeExam
 * @returns {string} - Bilan formaté
 */
function formatBilan(bilan) {
  let output = `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  output += `📊 BILAN DE L'EXAMEN\n`;
  output += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
  
  if (bilan.score !== undefined && bilan.total !== undefined) {
    const percentage = ((bilan.score / bilan.total) * 100).toFixed(2);
    output += `Score: ${bilan.score}/${bilan.total} (${percentage}%)\n\n`;
  }
  
  if (bilan.correctAnswers !== undefined) {
    output += `Bonnes réponses: ${bilan.correctAnswers}\n`;
  }
  
  if (bilan.wrongAnswers !== undefined) {
    output += `Mauvaises réponses: ${bilan.wrongAnswers}\n`;
  }
  
  if (bilan.details && Array.isArray(bilan.details)) {
    output += `\nDétails par question:\n`;
    bilan.details.forEach((detail, index) => {
      const status = detail.correct ? '✓' : '✗';
      output += `  ${status} Question ${index + 1}: ${detail.text || ''}\n`;
    });
  }
  
  output += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  return output;
}

/**
 * Enregistre les commandes du groupe "exam"
 * @param {Object} program - Instance Caporal program
 */
function registerExamCommands(program) {
  program
    .command('exam', 'Gérer les examens');

  // Commande: exam build
  program
    .command('exam build', 'Créer un examen à partir d\'une banque de questions')
    .argument('<file>', 'Fichier banque GIFT source')
    .option('--ids <ids>', 'Liste d\'IDs de questions séparés par virgules (ex: "1,2,4,5")', {
      required: true,
      validator: program.STRING
    })
    .action(({ args, options }) => {
      try {
        // Charger la banque GIFT
        const questions = loadGIFTQuestions(args.file);
        
        if (questions.length === 0) {
          throw new Error('La banque de questions est vide');
        }
        
        // Filtrer les questions selon les IDs
        const selectedQuestions = filterQuestionsByIds(questions, options.ids);
        
        if (selectedQuestions.length === 0) {
          throw new Error('Aucune question trouvée avec les IDs spécifiés');
        }
        
        // Créer l'examen avec ExamService
        const examService = new ExamService();
        const outputFile = `exam_${Date.now()}.gift`;
        examService.buildExam(selectedQuestions, outputFile);
        
        console.log(`✅ Examen créé avec succès: ${outputFile}`);
        console.log(`   Nombre de questions: ${selectedQuestions.length}`);
      } catch (error) {
        console.error(`❌ Erreur: ${error.message}`);
        process.exit(1);
      }
    });

  // Commande: exam check
  program
    .command('exam check', 'Vérifier la qualité d\'un examen')
    .argument('<file>', 'Fichier examen GIFT à vérifier')
    .action(({ args }) => {
      try {
        const examService = new ExamService();
        const checkResults = examService.checkExam(args.file);
        
        console.log(formatCheckResults(checkResults));
        
        process.exit(checkResults.isValid ? 0 : 1);
      } catch (error) {
        console.error(`❌ Erreur: ${error.message}`);
        process.exit(1);
      }
    });

  // Commande: exam simulate
  program
    .command('exam simulate', 'Simuler la passation d\'un examen')
    .argument('<file>', 'Fichier examen GIFT à simuler')
    .action(async ({ args }) => {
      try {
        // Charger l'examen
        const questions = loadGIFTQuestions(args.file);
        
        if (questions.length === 0) {
          throw new Error('L\'examen est vide');
        }
        
        // Simuler l'examen avec ExamService
        const examService = new ExamService();
        await examService.simulateExam(questions);
        
        console.log(`\n✅ Simulation terminée`);
      } catch (error) {
        console.error(`❌ Erreur: ${error.message}`);
        process.exit(1);
      }
    });

  // Commande: exam bilan
  program
    .command('exam bilan', 'Générer un bilan d\'examen')
    .argument('<exam-file>', 'Fichier examen GIFT')
    .argument('<answers-file>', 'Fichier JSON des réponses')
    .action(({ args }) => {
      try {
        // Vérifier que les fichiers existent
        if (!fs.existsSync(args.examFile)) {
          throw new Error(`Fichier examen introuvable: ${args.examFile}`);
        }
        
        if (!fs.existsSync(args.answersFile)) {
          throw new Error(`Fichier de réponses introuvable: ${args.answersFile}`);
        }
        
        // Charger les réponses JSON
        const answersData = JSON.parse(fs.readFileSync(args.answersFile, 'utf8'));
        
        // Générer le bilan avec ExamService
        const examService = new ExamService();
        const bilan = examService.analyzeExam(args.examFile, answersData);
        
        // Afficher le bilan
        console.log(formatBilan(bilan));
      } catch (error) {
        console.error(`❌ Erreur: ${error.message}`);
        process.exit(1);
      }
    });
}

module.exports = registerExamCommands;
