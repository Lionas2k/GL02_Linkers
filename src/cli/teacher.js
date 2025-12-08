/**
 * Module de commandes pour la gestion des enseignants
 * SPEC_3 - Génération de VCard enseignant
 */

const { generateVCard } = require('../services/vcardService');

/**
 * Enregistre les commandes du groupe "teacher"
 * @param {Object} program - Instance Caporal program
 */
function registerTeacherCommands(program) {
  program
    .command('teacher', 'Gérer les enseignants');

  // Validators pour rejeter les valeurs vides
  const createNonEmptyValidator = (fieldName) => {
    return (value) => {
      if (!value || typeof value !== 'string' || value.trim() === '') {
        throw new Error(`Le champ '${fieldName}' ne peut pas être vide`);
      }
      return value;
    };
  };

  // Commande: teacher vcard
  program
    .command('teacher vcard', 'Générer une VCard enseignant')
    .option('--nom <nom>', 'Nom de l\'enseignant', {
      required: true,
      validator: createNonEmptyValidator('nom')
    })
    .option('--prenom <prenom>', 'Prénom de l\'enseignant', {
      required: true,
      validator: createNonEmptyValidator('prenom')
    })
    .option('--email <email>', 'Email de l\'enseignant', {
      required: true,
      validator: createNonEmptyValidator('email')
    })
    .option('--etablissement <etablissement>', 'Établissement', {
      required: true,
      validator: createNonEmptyValidator('etablissement')
    })
    .option('--matiere <matiere>', 'Matière enseignée', {
      required: true,
      validator: createNonEmptyValidator('matiere')
    })
    .option('--output <file>', 'Fichier de sortie (.vcf)', {
      default: 'teacher.vcf',
      validator: program.STRING
    })
    .action(({ options }) => {
        try {
          const vcardData = {
            nom: String(options.nom).trim(),
            prenom: String(options.prenom).trim(),
            email: String(options.email).trim(),
            etablissement: String(options.etablissement).trim(),
            matiere: String(options.matiere).trim()
          };
      
          const outputFile = options.output;
          generateVCard(vcardData, outputFile);
          console.log(`VCard générée avec succès: ${outputFile}`);
        } catch (error) {
          console.error(`Erreur lors de la génération de la VCard: ${error.message}`);
          process.exit(1);
        }
      });
}

module.exports = registerTeacherCommands;
