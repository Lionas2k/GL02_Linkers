/**
 * Module de commandes pour la gestion des questions
 * SPEC_1 - Rechercher et visualiser une question
 * 
 * Intégration avec le parser GIFT d'Alexis
 */

// Imports pour l'intégration avec les modules externes
// TODO: Vérifier les exports exacts du GIFTParser et adapter les imports si nécessaire
const fs = require('fs');
const GIFTParser = require('../parser/GIFTParser');
const CollectionQuestion = require('../model/CollectionQuestion');

/**
 * Documentation des points d'intégration avec le Parser GIFT
 * 
 * GIFTParser (classe) :
 *   - new GIFTParser(showTokenize, showParsedSymb) : Crée une instance du parser
 *   - parser.parse(data) : Parse une chaîne GIFT et remplit parser.parsedQuestions
 *   - parser.parsedQuestions : Array d'objets Question après parsing
 * 
 * CollectionQuestion (classe) :
 *   - new CollectionQuestion() : Crée une collection vide
 *   - collection.addQuestion(question) : Ajoute une question
 *   - collection.getAll() : Retourne toutes les questions (Array)
 *   - collection.size() : Retourne le nombre de questions
 *   - collection.contains(question) : Vérifie si une question existe
 *   - TODO: Vérifier les méthodes de recherche (search, getById, filter)
 * 
 * Workflow questions search :
 *   1. Lire le fichier GIFT avec fs.readFileSync()
 *   2. Créer une instance GIFTParser
 *   3. Parser le contenu avec parser.parse(data)
 *   4. Créer une CollectionQuestion et ajouter les questions parsées
 *   5. Rechercher dans la collection selon keyword et type
 *   6. Formater les résultats selon --format
 * 
 * Workflow questions show :
 *   1. Lire le fichier GIFT avec fs.readFileSync()
 *   2. Créer une instance GIFTParser
 *   3. Parser le contenu avec parser.parse(data)
 *   4. Créer une CollectionQuestion et ajouter les questions parsées
 *   5. Récupérer la question par ID
 *   6. Formater selon --format (detailed/compact)
 */

/**
 * Fonctions helper pour le formatage des résultats
 */

/**
 * Formate une question pour l'affichage text
 * @param {Object} question - Objet Question
 * @param {string} format - Format d'affichage (detailed, compact)
 * @returns {string} - Question formatée
 */
function formatQuestionText(question, format = 'detailed') {
  if (!question) return '';
  
  if (format === 'compact') {
    const text = question.text || question.questionText || '';
    const shortText = text.length > 80 ? text.substring(0, 80) + '...' : text;
    return `[${question.id || 'N/A'}] ${question.type || 'UNKNOWN'}: ${shortText}`;
  }
  
  // Format detailed
  let output = `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  output += `ID: ${question.id || 'N/A'}\n`;
  output += `Type: ${question.type || 'UNKNOWN'}\n`;
  output += `Points: ${question.points || 1}\n`;
  output += `\nQuestion:\n${question.text || question.questionText || 'N/A'}\n`;
  
  if (question.answers && question.answers.length > 0) {
    output += `\nRéponses:\n`;
    question.answers.forEach((answer, index) => {
      const marker = answer.correct ? '✓' : ' ';
      output += `  ${marker} ${index + 1}. ${answer.text || answer}\n`;
    });
  }
  
  output += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  return output;
}

/**
 * Formate les résultats de recherche pour l'affichage JSON
 * @param {Array} questions - Liste de questions trouvées
 * @returns {string} - JSON formaté
 */
function formatQuestionsJSON(questions) {
  return JSON.stringify(questions, null, 2);
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
    // Vérifier que le fichier existe
    if (!fs.existsSync(filePath)) {
      throw new Error(`Fichier introuvable: ${filePath}`);
    }
    
    // Lire le fichier
    const data = fs.readFileSync(filePath, 'utf8');
    
    // Créer une instance du parser
    const parser = new GIFTParser(false, false);
    
    // Parser le contenu
    parser.parse(data);
    
    // Créer une collection et ajouter les questions
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
 * Recherche des questions dans une collection
 * @param {CollectionQuestion} collection - Collection de questions
 * @param {string} keyword - Mot-clé de recherche
 * @param {string} type - Type de question (optionnel)
 * @returns {Array} - Liste de questions trouvées
 */
function searchQuestions(collection, keyword, type) {
  if (!collection || collection.size() === 0) {
    return [];
  }
  
  const allQuestions = collection.getAll();
  const keywordLower = keyword.toLowerCase();
  
  let results = allQuestions.filter(question => {
    // Recherche par ID
    if (question.id && question.id.toLowerCase().includes(keywordLower)) {
      return true;
    }
    
    // Recherche par type
    if (question.type && question.type.toUpperCase() === keyword.toUpperCase()) {
      return true;
    }
    
    // Recherche dans le texte de la question
    const questionText = (question.text || question.questionText || '').toLowerCase();
    if (questionText.includes(keywordLower)) {
      return true;
    }
    
    return false;
  });
  
  // Filtrer par type si spécifié
  if (type) {
    results = results.filter(question => {
      return question.type && question.type.toUpperCase() === type.toUpperCase();
    });
  }
  
  return results;
}

/**
 * Récupère une question par son ID
 * @param {CollectionQuestion} collection - Collection de questions
 * @param {string} id - ID de la question
 * @returns {Object|null} - Question trouvée ou null
 */
function getQuestionById(collection, id) {
  if (!collection || collection.size() === 0) {
    return null;
  }
  
  const allQuestions = collection.getAll();
  const question = allQuestions.find(q => {
    return q.id && q.id.toLowerCase() === id.toLowerCase();
  });
  
  return question || null;
}

/**
 * Enregistre les commandes du groupe "questions"
 * @param {Object} program - Instance Caporal program
 */
function registerQuestionsCommands(program) {
  // Groupe principal "questions"
  program
    .command('questions', 'Gérer les questions');

  // Commande: questions search
  program
    .command('questions search', 'Rechercher une question')
    .argument('<keyword>', 'Mot-clé, ID ou type de question à rechercher')
    .option('--type <type>', 'Filtrer par type de question (MCQ, TF, NUMERIC, MATCH, SHORTANSWER)', {
      validator: program.STRING
    })
    .option('--file <file>', 'Fichier GIFT source à analyser', {
      default: 'questions.gift',
      validator: program.STRING
    })
    .option('--format <format>', 'Format de sortie (text, json)', {
      default: 'text',
      validator: ['text', 'json']
    })
    .action(({ args, options }) => {
      try {
        // Charger et parser le fichier GIFT
        const collection = loadGIFTFile(options.file);
        
        // Rechercher les questions
        const results = searchQuestions(collection, args.keyword, options.type);
        
        if (results.length === 0) {
          console.log(`❌ Aucune question trouvée pour "${args.keyword}"`);
          if (options.type) {
            console.log(`   Type filtré: ${options.type}`);
          }
          process.exit(0);
        }
        
        // Formater et afficher les résultats
        if (options.format === 'json') {
          console.log(formatQuestionsJSON(results));
        } else {
          console.log(`\n✅ ${results.length} question(s) trouvée(s):\n`);
          results.forEach((question, index) => {
            console.log(`${index + 1}.${formatQuestionText(question, 'compact')}`);
          });
        }
      } catch (error) {
        handleError(error, 'questions search');
      }
    });

  // Commande: questions show
  program
    .command('questions show', 'Afficher une question en détail')
    .argument('<id>', 'ID unique de la question à afficher')
    .option('--file <file>', 'Fichier GIFT source à analyser', {
      default: 'questions.gift',
      validator: program.STRING
    })
    .option('--format <format>', 'Format d\'affichage (detailed, compact)', {
      default: 'detailed',
      validator: ['detailed', 'compact']
    })
    .action(({ args, options }) => {
      try {
        // Charger et parser le fichier GIFT
        const collection = loadGIFTFile(options.file);
        
        // Récupérer la question par ID
        const question = getQuestionById(collection, args.id);
        
        if (!question) {
          console.error(`❌ Question introuvable: ${args.id}`);
          process.exit(1);
        }
        
        // Formater et afficher la question
        if (options.format === 'compact') {
          console.log(formatQuestionText(question, 'compact'));
        } else {
          console.log(formatQuestionText(question, 'detailed'));
        }
      } catch (error) {
        handleError(error, 'questions show');
      }
    });
}

module.exports = registerQuestionsCommands;
