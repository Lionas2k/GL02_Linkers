/**
 * Module de commandes pour la gestion des examens
 * SPEC_2, SPEC_4, SPEC_5, SPEC_6 - Création, vérification, simulation et bilan d'examens
 * 
 * Intégration avec le module ExamService d'Othmane
 */

const fs = require('fs');
const readline = require('readline');
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
 * @param {string} idsString - Liste d'IDs séparés par virgules (ex: "1,2,4,5" ou "Q1,Q2,Q4,Q5")
 * @returns {Array} - Questions filtrées
 */
function filterQuestionsByIds(questions, idsString) {
  const ids = idsString.split(',').map(id => id.trim());
  const filtered = [];
  const notFound = [];
  
  ids.forEach(id => {
    let question = questions.find(q => {
      const qId = String(q.id || (q.getId ? q.getId() : '')).trim();
      return qId.toLowerCase() === id.toLowerCase();
    });
    
    // Si pas trouvé et que l'ID est un nombre pur, essayer avec "Q" + id
    if (!question && /^\d+$/.test(id)) {
      const idWithQ = 'Q' + id;
      question = questions.find(q => {
        const qId = String(q.id || (q.getId ? q.getId() : '')).trim();
        return qId.toLowerCase() === idWithQ.toLowerCase();
      });
    }
    
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
      const questionText = detail.questionText || detail.text || `Question ${detail.questionId || index + 1}`;
      output += `  ${status} ${questionText}\n`;
      if (detail.userAnswer !== undefined) {
        output += `      Réponse: ${detail.userAnswer}\n`;
      }
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
        
        // Créer l'examen avec ExamService (singleton)
        // Le fichier généré sera "generatedExam.gift" dans le dossier courant
        const outputFile = 'generatedExam.gift';
        ExamService.buildExam(selectedQuestions, outputFile);
        
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
        // Charger l'examen
        const questions = loadGIFTQuestions(args.file);
        
        // Créer une collection pour vérifier
        const collection = new CollectionQuestion();
        questions.forEach(q => collection.addQuestion(q));
        
        // Vérifier la validité
        const isValid = collection.isValidExam();
        const questionCount = collection.size();
        
        // Détecter les doublons
        const ids = questions.map(q => q.id || (q.getId ? q.getId() : ''));
        const uniqueIds = new Set(ids);
        const duplicates = ids.length !== uniqueIds.size;
        
        const checkResults = {
          isValid: isValid && !duplicates,
          questionCount: questionCount,
          duplicates: duplicates ? ['Des doublons détectés'] : [],
          errors: []
        };
        
        if (!isValid) {
          if (questionCount < 15) {
            checkResults.errors.push(`Trop peu de questions: ${questionCount} (minimum 15)`);
          } else if (questionCount > 20) {
            checkResults.errors.push(`Trop de questions: ${questionCount} (maximum 20)`);
          }
        }
        
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
        
        // Simuler l'examen avec affichage amélioré pour les questions MATCH
        const responses = [];
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout
        });

        const ask = (text) => {
          return new Promise(resolve => {
            rl.question(text, answer => {
              resolve(answer.trim());
            });
          });
        };

        for (const q of questions) {
          console.log("\n==============================");
          console.log("Question :");
          console.log(q.enonce || (q.getTexte ? q.getTexte() : ''));
          
          // Affichage spécial pour les questions MATCH
          if (q.type === "MATCH" && q.reponses && q.reponses.length > 0) {
            console.log("\nPaires à associer :");
            const matchPairs = q.reponses.filter(rep => rep.assoc);
            matchPairs.forEach((rep, index) => {
              console.log(`  ${rep.resp} -> ${rep.assoc}`);
            });
          }
          
          const answer = await ask("\nVotre réponse : ");
          responses.push({
            questionId: q.id || (q.getId ? q.getId() : ''),
            userAnswer: answer
          });
        }

        rl.close();
        
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
        
        // Charger l'examen
        const questions = loadGIFTQuestions(args.examFile);
        
        // Charger les réponses JSON
        const answersData = JSON.parse(fs.readFileSync(args.answersFile, 'utf8'));
        
        // Convertir les réponses en format attendu (array de {questionId, userAnswer})
        const responses = Array.isArray(answersData) ? answersData : 
          (answersData.responses || answersData.answers || []);
        
        // Générer le bilan avec ExamService (singleton)
        const bilan = ExamService.analyzeExam(questions, responses);
        
        // Afficher le bilan
        console.log(formatBilan(bilan));
      } catch (error) {
        console.error(`❌ Erreur: ${error.message}`);
        process.exit(1);
      }
    });
}

module.exports = registerExamCommands;
