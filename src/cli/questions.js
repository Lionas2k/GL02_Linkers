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
  const text = question.enonce || question.getTexte ? question.getTexte() : '';
  const shortText = text.length > 60 ? text.substring(0, 60) + '...' : text;
  
  return `${String(id).padEnd(10)} ${String(type).padEnd(10)} ${shortText}`;
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
  output += `\nQuestion:\n${question.enonce || (question.getTexte ? question.getTexte() : 'N/A')}\n`;
  
  if (question.reponses && question.reponses.length > 0) {
    output += `\nRéponses:\n`;
    question.reponses.forEach((answer, index) => {
      const marker = answer.isCorrect ? '✓' : ' ';
      const answerText = answer.resp || answer || '';
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
  const text = question.enonce || (question.getTexte ? question.getTexte() : '');
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
    const questionText = (question.enonce || (question.getTexte ? question.getTexte() : '')).toLowerCase();
    if (questionText.includes(keywordLower)) {
      return true;
    }
    
    // Recherche dans les réponses
    if (question.reponses && Array.isArray(question.reponses)) {
      for (const answer of question.reponses) {
        const answerText = (answer.resp || answer || '').toLowerCase();
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
 * @param {string} id - ID de la question (peut être "1" ou "Q1")
 * @returns {Object|null} - Question trouvée ou null
 */
function getQuestionById(collection, id) {
  if (!collection || collection.size() === 0) {
    return null;
  }
  
  const allQuestions = collection.getAll();
  const idStr = String(id).trim();
  
  // Essayer d'abord avec l'ID tel quel (ex: "Q1")
  let question = allQuestions.find(q => {
    const qId = String(q.id || (q.getId ? q.getId() : ''));
    return qId.toLowerCase() === idStr.toLowerCase();
  });
  
  // Si pas trouvé et que l'ID est un nombre ou commence par un nombre, essayer avec "Q" + id
  if (!question && /^\d+$/.test(idStr)) {
    const idWithQ = 'Q' + idStr;
    question = allQuestions.find(q => {
      const qId = String(q.id || (q.getId ? q.getId() : ''));
      return qId.toLowerCase() === idWithQ.toLowerCase();
    });
  }
  
  return question || null;
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
