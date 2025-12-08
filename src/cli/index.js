#!/usr/bin/env node

/**
 * Point d'entrée principal de la CLI GL02 Linkers
 * Initialise Caporal.js et enregistre toutes les commandes
 */

const { program } = require('@caporal/core');

// Import des modules de commandes
const questionsCommands = require('./questions');
const examCommands = require('./exam');
const profileCommands = require('./profile');
const teacherCommands = require('./teacher');

// Configuration globale de Caporal
program
  .name('gl02-linkers')
  .version('1.0.0')
  .description('Outil de gestion des examens en ligne de commande pour le ministère de l\'Éducation de Sealand');

// Enregistrement des groupes de commandes
questionsCommands(program);
examCommands(program);
profileCommands(program);
teacherCommands(program);

// Lancer le programme
program.run(process.argv);
