/**
 * Module de commandes pour l'analyse statistique des examens
 * SPEC_7, SPEC_8, SPEC_9 - Profil, histogramme et comparaison d'examens
 * 
 * Intégration avec le module ProfileService d'Enzo
 */

const fs = require('fs');
const GIFTParser = require('../parser/GIFTParser');
const { buildProfile, printHistogram, compareProfiles } = require('../services/profileService');

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
 * Formate les résultats du profil pour l'affichage
 * @param {Object} profile - Profil retourné par buildProfile()
 * @returns {string} - Profil formaté
 */
function formatProfile(profile) {
  let output = `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  output += `📊 PROFIL DE L'EXAMEN\n`;
  output += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
  
  if (profile.total !== undefined) {
    output += `Total de questions: ${profile.total}\n\n`;
  }
  
  output += `Répartition par type:\n`;
  
  // Afficher les types de questions depuis counts
  if (profile.counts) {
    Object.keys(profile.counts).forEach(type => {
      const count = profile.counts[type];
      const percent = profile.percents ? profile.percents[type] : 0;
      if (count > 0) {
        output += `  ${type.padEnd(12)} ${count} (${percent.toFixed(2)}%)\n`;
      }
    });
  }
  
  output += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  return output;
}

/**
 * Formate les résultats de comparaison
 * @param {Object} comparison - Résultats de compareProfiles()
 * @returns {string} - Comparaison formatée
 */
function formatComparison(comparison) {
  let output = `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  output += `🔍 COMPARAISON D'EXAMENS\n`;
  output += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
  
  if (comparison.similarity !== undefined) {
    output += `Score de similarité: ${comparison.similarity}%\n\n`;
  }
  
  if (comparison.diffs) {
    output += `Différences par type:\n`;
    Object.keys(comparison.diffs).forEach(type => {
      const diff = comparison.diffs[type];
      const fileA = diff.a !== undefined ? diff.a : 0;
      const fileB = diff.b !== undefined ? diff.b : 0;
      const diffPercent = diff.diffPercent !== undefined ? diff.diffPercent.toFixed(2) : '0.00';
      output += `  ${type.padEnd(12)} Fichier A: ${fileA}, Fichier B: ${fileB}, Différence: ${diffPercent}%\n`;
    });
  }
  
  output += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  return output;
}

/**
 * Enregistre les commandes du groupe "profile"
 * @param {Object} program - Instance Caporal program
 */
function registerProfileCommands(program) {
  program
    .command('profile', 'Analyser les profils d\'examens');

  // Commande: profile show
  program
    .command('profile show', 'Afficher le profil d\'un examen')
    .argument('<file>', 'Fichier examen ou GIFT à analyser')
    .action(({ args }) => {
      try {
        // Charger et parser le fichier GIFT
        const questions = loadGIFTQuestions(args.file);
        
        // Générer le profil
        const profile = buildProfile(questions);
        
        // Afficher le profil formaté
        console.log(formatProfile(profile));
      } catch (error) {
        console.error(`❌ Erreur: ${error.message}`);
        process.exit(1);
      }
    });

  // Commande: profile histogram
  program
    .command('profile histogram', 'Afficher un histogramme ASCII')
    .argument('<file>', 'Fichier examen ou GIFT à analyser')
    .action(({ args }) => {
      try {
        // Charger et parser le fichier GIFT
        const questions = loadGIFTQuestions(args.file);
        
        // Générer le profil
        const profile = buildProfile(questions);
        
        // Afficher l'histogramme (printHistogram affiche déjà dans la console)
        printHistogram(profile, { width: 30, barChar: '█' });
      } catch (error) {
        console.error(`❌ Erreur: ${error.message}`);
        process.exit(1);
      }
    });

  // Commande: profile compare
  program
    .command('profile compare', 'Comparer deux banques d\'examens')
    .argument('<fileA>', 'Premier fichier examen ou GIFT')
    .argument('<fileB>', 'Deuxième fichier examen ou GIFT')
    .action(({ args }) => {
      try {
        // Charger et parser les deux fichiers GIFT
        const questionsA = loadGIFTQuestions(args.fileA);
        const questionsB = loadGIFTQuestions(args.fileB);
        
        // Générer les profils
        const profileA = buildProfile(questionsA);
        const profileB = buildProfile(questionsB);
        
        // Comparer les profils
        const comparison = compareProfiles(profileA, profileB);
        
        // Afficher la comparaison formatée
        console.log(formatComparison(comparison));
      } catch (error) {
        console.error(`❌ Erreur: ${error.message}`);
        process.exit(1);
      }
    });
}

module.exports = registerProfileCommands;
