/**
 * Module de commandes pour l'analyse statistique des examens
 * SPEC_7, SPEC_8, SPEC_9 - Profil, histogramme et comparaison d'examens
 * 
 * Intégration avec le module ProfileService d'Enzo
 */

const fs = require('fs');
const ProfileService = require('../services/profileService');

/**
 * Formate les résultats du profil pour l'affichage
 * @param {Object} profile - Profil retourné par getProfile()
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
  
  // Afficher les types de questions (MCQ, TF, MATCH, etc.)
  if (profile.MCQ !== undefined) {
    output += `  MCQ:    ${profile.MCQ}\n`;
  }
  if (profile.TF !== undefined) {
    output += `  TF:     ${profile.TF}\n`;
  }
  if (profile.MATCH !== undefined) {
    output += `  MATCH:  ${profile.MATCH}\n`;
  }
  if (profile.NUMERIC !== undefined) {
    output += `  NUMERIC: ${profile.NUMERIC}\n`;
  }
  if (profile.SHORTANSWER !== undefined) {
    output += `  SHORTANSWER: ${profile.SHORTANSWER}\n`;
  }
  
  // Afficher les autres types s'il y en a
  const knownTypes = ['MCQ', 'TF', 'MATCH', 'NUMERIC', 'SHORTANSWER'];
  Object.keys(profile).forEach(key => {
    if (!knownTypes.includes(key) && key !== 'total' && typeof profile[key] === 'number') {
      output += `  ${key}: ${profile[key]}\n`;
    }
  });
  
  output += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  return output;
}

/**
 * Formate les résultats de comparaison
 * @param {Object} comparison - Résultats de compare()
 * @returns {string} - Comparaison formatée
 */
function formatComparison(comparison) {
  let output = `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  output += `🔍 COMPARAISON D'EXAMENS\n`;
  output += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
  
  if (comparison.similarity !== undefined) {
    output += `Score de similarité: ${comparison.similarity}%\n\n`;
  }
  
  if (comparison.differences) {
    output += `Différences par type:\n`;
    Object.keys(comparison.differences).forEach(type => {
      const diff = comparison.differences[type];
      const fileA = diff.fileA !== undefined ? diff.fileA : diff.exam1 || 0;
      const fileB = diff.fileB !== undefined ? diff.fileB : diff.exam2 || 0;
      const difference = diff.difference !== undefined ? diff.difference : diff.diff || 0;
      output += `  ${type.padEnd(12)} Fichier A: ${fileA}, Fichier B: ${fileB}, Différence: ${difference}\n`;
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
        if (!fs.existsSync(args.file)) {
          throw new Error(`Fichier introuvable: ${args.file}`);
        }
        
        const profile = ProfileService.getProfile(args.file);
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
        if (!fs.existsSync(args.file)) {
          throw new Error(`Fichier introuvable: ${args.file}`);
        }
        
        const histogram = ProfileService.getHistogram(args.file);
        console.log(histogram);
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
        if (!fs.existsSync(args.fileA)) {
          throw new Error(`Fichier introuvable: ${args.fileA}`);
        }
        
        if (!fs.existsSync(args.fileB)) {
          throw new Error(`Fichier introuvable: ${args.fileB}`);
        }
        
        const comparison = ProfileService.compare(args.fileA, args.fileB);
        console.log(formatComparison(comparison));
      } catch (error) {
        console.error(`❌ Erreur: ${error.message}`);
        process.exit(1);
      }
    });
}

module.exports = registerProfileCommands;
