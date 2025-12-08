/**
 * Module de commandes pour la gestion des questions
 * SPEC_1 - Rechercher et visualiser une question
 * 
 * Intégration future avec le parser GIFT d'Alexis
 */

// Imports pour la future intégration (commentés jusqu'à ce que les modules soient prêts)
// const { parseGIFT, searchQuestion, getQuestionById } = require('../parser/parserGift');
// const { CollectionQuestion } = require('../parser/CollectionQuestion');

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
