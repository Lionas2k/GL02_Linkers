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
  // TODO: Implémenter le formatage selon le format
  // Format detailed : affichage complet avec toutes les informations
  // Format compact : affichage condensé
  return '';
}

/**
 * Formate les résultats de recherche pour l'affichage JSON
 * @param {Array} questions - Liste de questions trouvées
 * @returns {string} - JSON formaté
 */
function formatQuestionsJSON(questions) {
  // TODO: Implémenter le formatage JSON
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
  // TODO: Implémenter le chargement et parsing
  // 1. Lire le fichier avec fs.readFileSync()
  // 2. Créer une instance GIFTParser
  // 3. Parser le contenu
  // 4. Créer une CollectionQuestion et ajouter les questions
  // 5. Retourner la collection
  return null;
}

/**
 * Recherche des questions dans une collection
 * @param {CollectionQuestion} collection - Collection de questions
 * @param {string} keyword - Mot-clé de recherche
 * @param {string} type - Type de question (optionnel)
 * @returns {Array} - Liste de questions trouvées
 */
function searchQuestions(collection, keyword, type) {
  // TODO: Implémenter la recherche
  // Utiliser les méthodes de CollectionQuestion pour rechercher
  return [];
}

/**
 * Récupère une question par son ID
 * @param {CollectionQuestion} collection - Collection de questions
 * @param {string} id - ID de la question
 * @returns {Object|null} - Question trouvée ou null
 */
function getQuestionById(collection, id) {
  // TODO: Implémenter la récupération par ID
  // Utiliser les méthodes de CollectionQuestion
  return null;
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
      console.log('🔍 Commande: questions search');
      console.log(`   Mot-clé: ${args.keyword}`);
      if (options.type) {
        console.log(`   Type: ${options.type}`);
      }
      console.log(`   Fichier: ${options.file}`);
      console.log(`   Format: ${options.format}`);
      console.log('\n⚠️  En attente du parser GIFT d\'Alexis');
      console.log('   Cette commande appellera: parseGIFT() et searchQuestion()');
      console.log('   Une fois le module parser prêt, cette fonctionnalité sera opérationnelle.');
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
      console.log('📄 Commande: questions show');
      console.log(`   ID: ${args.id}`);
      console.log(`   Fichier: ${options.file}`);
      console.log(`   Format: ${options.format}`);
      console.log('\n⚠️  En attente du parser GIFT d\'Alexis');
      console.log('   Cette commande appellera: parseGIFT() et getQuestionById()');
      console.log('   Une fois le module parser prêt, cette fonctionnalité sera opérationnelle.');
    });
}

module.exports = registerQuestionsCommands;
