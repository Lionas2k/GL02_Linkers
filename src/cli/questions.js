/**
 * Module de commandes pour la gestion des questions
 * SPEC_1 - Lister, afficher et rechercher des questions
 * 
 * Intégration avec le parser GIFT
 */

const fs = require('fs');
const GIFTParser = require('../parser/GIFTParser');
const CollectionQuestion = require('../model/CollectionQuestion');

/**
 * Charge et parse un fichier GIFT
 * @param {string} filePath - Chemin du fichier GIFT
 * @returns {CollectionQuestion} - Collection de questions parsées
 */
function loadGIFTFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Fichier introuvable: ${filePath}`);
  }
  
  try {
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
    throw new Error(`Erreur lors du parsing du fichier GIFT: ${error.message}`);
  }
}

/**
 * Formate une question pour l'affichage list (ID, type, texte court)
 * @param {Object} question - Objet Question
 * @returns {string} - Question formatée
 */
function formatQuestionList(question) {
  const id = question.id || 'N/A';
  const type = question.type || 'UNKNOWN';
  const text = question.text || question.questionText || '';
  const shortText = text.length > 60 ? text.substring(0, 60) + '...' : text;
  
  return `${id.padEnd(10)} ${type.padEnd(10)} ${shortText}`;
}

/**
 * Formate une question pour l'affichage détaillé
 * @param {Object} question - Objet Question
 * @returns {string} - Question formatée
 */
function formatQuestionDetailed(question) {
  let output = `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  output += `ID: ${question.id || 'N/A'}\n`;
  output += `Type: ${question.type || 'UNKNOWN'}\n`;
  output += `Points: ${question.points || 1}\n`;
  output += `\nQuestion:\n${question.text || question.questionText || 'N/A'}\n`;
  
  if (question.answers && question.answers.length > 0) {
    output += `\nRéponses:\n`;
    question.answers.forEach((answer, index) => {
      const marker = answer.correct ? '✓' : ' ';
      const answerText = answer.text || answer || '';
      output += `  ${marker} ${index + 1}. ${answerText}\n`;
    });
  }
  
  output += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  return output;
}

/**
 * Formate une question pour l'affichage search (ID + preview)
 * @param {Object} question - Objet Question
 * @returns {string} - Question formatée
 */
function formatQuestionPreview(question) {
  const id = question.id || 'N/A';
  const text = question.text || question.questionText || '';
  const preview = text.length > 80 ? text.substring(0, 80) + '...' : text;
  
  return `[${id}] ${preview}`;
}

/**
 * Recherche des questions par mot-clé
 * @param {CollectionQuestion} collection - Collection de questions
 * @param {string} keyword - Mot-clé de recherche
 * @returns {Array} - Liste de questions trouvées
 */
function searchQuestions(collection, keyword) {
  if (!collection || collection.size() === 0) {
    return [];
  }
  
  const allQuestions = collection.getAll();
  const keywordLower = keyword.toLowerCase();
  
  return allQuestions.filter(question => {
    // Recherche dans le texte de la question
    const questionText = (question.text || question.questionText || '').toLowerCase();
    if (questionText.includes(keywordLower)) {
      return true;
    }
    
    // Recherche dans les réponses
    if (question.answers && Array.isArray(question.answers)) {
      for (const answer of question.answers) {
        const answerText = (answer.text || answer || '').toLowerCase();
        if (answerText.includes(keywordLower)) {
          return true;
        }
      }
    }
    
    return false;
  });
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
  return allQuestions.find(q => {
    return q.id && q.id.toLowerCase() === id.toLowerCase();
  }) || null;
}

/**
 * Enregistre les commandes du groupe "questions"
 * @param {Object} program - Instance Caporal program
 */
function registerQuestionsCommands(program) {
  program
    .command('questions', 'Gérer les questions');

  // Commande: questions list
  program
    .command('questions list', 'Lister toutes les questions d\'un fichier GIFT')
    .argument('<file>', 'Fichier GIFT à analyser')
    .action(({ args }) => {
      try {
        const collection = loadGIFTFile(args.file);
        const questions = collection.getAll();
        
        if (questions.length === 0) {
          console.log('Aucune question trouvée dans le fichier.');
          return;
        }
        
        console.log(`\n${questions.length} question(s) trouvée(s):\n`);
        console.log('ID'.padEnd(10) + 'Type'.padEnd(10) + 'Texte');
        console.log('-'.repeat(80));
        
        questions.forEach(question => {
          console.log(formatQuestionList(question));
        });
      } catch (error) {
        console.error(`❌ Erreur: ${error.message}`);
        process.exit(1);
      }
    });

  // Commande: questions show
  program
    .command('questions show', 'Afficher une question en détail')
    .argument('<file>', 'Fichier GIFT à analyser')
    .option('--id <id>', 'ID de la question à afficher', {
      required: true,
      validator: program.STRING
    })
    .action(({ args, options }) => {
      try {
        const collection = loadGIFTFile(args.file);
        const question = getQuestionById(collection, options.id);
        
        if (!question) {
          console.error(`❌ Question introuvable: ${options.id}`);
          process.exit(1);
        }
        
        console.log(formatQuestionDetailed(question));
      } catch (error) {
        console.error(`❌ Erreur: ${error.message}`);
        process.exit(1);
      }
    });

  // Commande: questions search
  program
    .command('questions search', 'Rechercher des questions par mot-clé')
    .argument('<file>', 'Fichier GIFT à analyser')
    .option('--keyword <keyword>', 'Mot-clé à rechercher', {
      required: true,
      validator: program.STRING
    })
    .action(({ args, options }) => {
      try {
        const collection = loadGIFTFile(args.file);
        const results = searchQuestions(collection, options.keyword);
        
        if (results.length === 0) {
          console.log(`Aucune question trouvée pour "${options.keyword}"`);
          return;
        }
        
        console.log(`\n${results.length} question(s) trouvée(s) pour "${options.keyword}":\n`);
        results.forEach((question, index) => {
          console.log(`${index + 1}. ${formatQuestionPreview(question)}`);
        });
      } catch (error) {
        console.error(`❌ Erreur: ${error.message}`);
        process.exit(1);
      }
    });
}

module.exports = registerQuestionsCommands;
