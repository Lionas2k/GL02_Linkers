/**
 * Module de commandes pour l'analyse statistique des examens
 * SPEC_7, SPEC_8, SPEC_9 - Profil, histogramme et comparaison d'examens
 * 
 * Intégration avec le module profil d'Enzo
 */

// Imports pour l'intégration avec les modules externes
// TODO: Vérifier les exports exacts et adapter les imports si nécessaire
const fs = require('fs');
const GIFTParser = require('../parser/GIFTParser');
const { buildProfile, printHistogram, compareProfiles } = require('../services/profileService');

/**
 * Documentation des points d'intégration avec ProfileService
 * 
 * ProfileService (fonctions exportées) :
 *   - buildProfile(questions, knownTypes) : Génère un profil statistique
 *     * Paramètres : questions (Array de Question), knownTypes (Array, optionnel)
 *     * Retourne : Object { total, counts, percents }
 *     * Exemple : { total: 18, counts: { MC: 12, TF: 2, ... }, percents: { MC: 66.67, ... } }
 *   - printHistogram(profile, options) : Génère un histogramme ASCII
 *     * Paramètres : profile (Object de buildProfile), options { width, barChar }
 *     * Retourne : String avec l'histogramme ASCII
 *   - compareProfiles(profile1, profile2) : Compare deux profils
 *     * Paramètres : profile1, profile2 (Objects de buildProfile)
 *     * Retourne : Object avec score de similarité et différences
 * 
 * Dépendances :
 *   - ProfileService dépend du Parser GIFT pour parser les examens
 *   - Nécessite de parser l'examen pour obtenir la liste de questions
 * 
 * Workflow profile show :
 *   1. Charger l'examen avec GIFTParser
 *   2. Obtenir la liste de questions
 *   3. Appeler buildProfile(questions)
 *   4. Formater selon --format (text/json)
 *   5. Afficher les statistiques (total, par type, pourcentages)
 * 
 * Workflow profile histogram :
 *   1. Charger l'examen avec GIFTParser
 *   2. Obtenir la liste de questions
 *   3. Appeler buildProfile(questions) pour obtenir le profil
 *   4. Appeler printHistogram(profile, { width, barChar })
 *   5. Appliquer le tri selon --sort (count/type/name)
 *   6. Afficher l'histogramme ASCII
 * 
 * Workflow profile compare :
 *   1. Charger les deux examens avec GIFTParser
 *   2. Obtenir les listes de questions pour chaque examen
 *   3. Appeler buildProfile(questions1) et buildProfile(questions2)
 *   4. Appeler compareProfiles(profile1, profile2)
 *   5. Formater selon --format (text/json)
 *   6. Mode --detailed : affichage détaillé des différences
 *   7. Afficher le score de similarité et les différences par type
 */

/**
 * Fonctions helper pour le formatage des résultats
 */

/**
 * Formate un profil pour l'affichage text
 * @param {Object} profile - Profil généré par buildProfile
 * @returns {string} - Profil formaté
 */
function formatProfileText(profile) {
  let output = '\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
  output += `📊 PROFIL DE L'EXAMEN\n`;
  output += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
  output += `Total de questions: ${profile.total}\n\n`;
  output += `Répartition par type:\n`;
  
  const types = Object.keys(profile.counts || {}).sort();
  types.forEach(type => {
    const count = profile.counts[type];
    const percent = profile.percents[type] || 0;
    output += `  ${type.padEnd(10)} ${count.toString().padStart(3)} questions (${percent.toFixed(2)}%)\n`;
  });
  
  output += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  return output;
}

/**
 * Formate un profil pour l'affichage JSON
 * @param {Object} profile - Profil généré par buildProfile
 * @returns {string} - JSON formaté
 */
function formatProfileJSON(profile) {
  return JSON.stringify(profile, null, 2);
}

/**
 * Formate les résultats de comparaison
 * @param {Object} comparison - Résultats de compareProfiles
 * @param {boolean} detailed - Mode détaillé
 * @returns {string} - Comparaison formatée
 */
function formatComparison(comparison, detailed = false) {
  let output = '\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
  output += `🔍 COMPARAISON D'EXAMENS\n`;
  output += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
  output += `Score de similarité: ${comparison.similarity}%\n\n`;
  
  if (comparison.differences && Object.keys(comparison.differences).length > 0) {
    output += `Différences par type:\n`;
    Object.keys(comparison.differences).forEach(type => {
      const diff = comparison.differences[type];
      output += `  ${type.padEnd(10)} Examen 1: ${diff.exam1 || 0}, Examen 2: ${diff.exam2 || 0}, Différence: ${diff.diff || 0}\n`;
    });
  }
  
  if (detailed && comparison.details) {
    output += `\nDétails:\n`;
    output += JSON.stringify(comparison.details, null, 2);
  }
  
  output += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  return output;
}

/**
 * Trie un histogramme selon l'ordre spécifié
 * @param {string} histogram - Histogramme ASCII
 * @param {string} sortOrder - Ordre de tri (count, type, name)
 * @returns {string} - Histogramme trié
 */
function sortHistogram(histogram, sortOrder) {
  if (!histogram || sortOrder === 'count') {
    return histogram; // Déjà trié par count par défaut
  }
  
  const lines = histogram.split('\n').filter(line => line.trim());
  const header = lines[0] || '';
  const dataLines = lines.slice(1);
  
  if (sortOrder === 'type' || sortOrder === 'name') {
    dataLines.sort((a, b) => {
      const typeA = a.split(/\s+/)[0] || '';
      const typeB = b.split(/\s+/)[0] || '';
      return typeA.localeCompare(typeB);
    });
  }
  
  return [header, ...dataLines].join('\n');
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
 * @returns {Array} - Liste de questions parsées
 */
function loadGIFTFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error(`Fichier introuvable: ${filePath}`);
    }
    
    const data = fs.readFileSync(filePath, 'utf8');
    const parser = new GIFTParser(false, false);
    parser.parse(data);
    
    return parser.parsedQuestions || [];
  } catch (error) {
    if (error.message.includes('introuvable')) {
      throw error;
    }
    throw new Error(`Erreur lors du parsing du fichier GIFT: ${error.message}`);
  }
}

/**
 * Enregistre les commandes du groupe "profile"
 * @param {Object} program - Instance Caporal program
 */
function registerProfileCommands(program) {
  // Groupe principal "profile"
  program
    .command('profile', 'Analyser les profils d\'examens');

  // Commande: profile show
  program
    .command('profile show', 'Générer un profil d\'examen')
    .argument('<file>', 'Fichier examen GIFT à analyser')
    .option('--format <format>', 'Format de sortie (text, json)', {
      default: 'text',
      validator: ['text', 'json']
    })
    .action(({ args, options }) => {
      try {
        // Charger l'examen
        const questions = loadGIFTFile(args.file);
        
        // Générer le profil
        const profile = buildProfile(questions);
        
        // Formater et afficher
        if (options.format === 'json') {
          console.log(formatProfileJSON(profile));
        } else {
          console.log(formatProfileText(profile));
        }
      } catch (error) {
        handleError(error, 'profile show');
      }
    });

  // Commande: profile histogram
  program
    .command('profile histogram', 'Visualiser un histogramme ASCII')
    .argument('<file>', 'Fichier examen GIFT à analyser')
    .option('--width <number>', 'Largeur maximale de l\'histogramme', {
      default: 50,
      validator: program.NUMBER
    })
    .option('--sort <order>', 'Tri (count, type, name)', {
      default: 'count',
      validator: ['count', 'type', 'name']
    })
    .action(({ args, options }) => {
      try {
        // Charger l'examen
        const questions = loadGIFTFile(args.file);
        
        // Générer le profil
        const profile = buildProfile(questions);
        
        // Générer l'histogramme
        const histogram = printHistogram(profile, { width: options.width, barChar: '█' });
        
        // Trier si nécessaire
        const sortedHistogram = sortHistogram(histogram, options.sort);
        
        console.log(sortedHistogram);
      } catch (error) {
        handleError(error, 'profile histogram');
      }
    });

  // Commande: profile compare
  program
    .command('profile compare', 'Comparer deux examens')
    .argument('<file1>', 'Premier fichier examen')
    .argument('<file2>', 'Deuxième fichier examen')
    .option('--format <format>', 'Format de sortie (text, json)', {
      default: 'text',
      validator: ['text', 'json']
    })
    .option('--detailed', 'Affichage détaillé des différences', {
      flag: true
    })
    .action(({ args, options }) => {
      try {
        // Charger les deux examens
        const questions1 = loadGIFTFile(args.file1);
        const questions2 = loadGIFTFile(args.file2);
        
        // Générer les profils
        const profile1 = buildProfile(questions1);
        const profile2 = buildProfile(questions2);
        
        // Comparer
        const comparison = compareProfiles(profile1, profile2);
        
        // Formater et afficher
        if (options.format === 'json') {
          console.log(JSON.stringify(comparison, null, 2));
        } else {
          console.log(formatComparison(comparison, options.detailed));
        }
      } catch (error) {
        handleError(error, 'profile compare');
      }
    });
}

module.exports = registerProfileCommands;
