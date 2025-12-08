/**
 * Module de génération de VCard selon les normes RFC 6350 & RFC 6868
 * SPEC_3 - Génération d'une VCard enseignant
 */

const fs = require('fs');
const path = require('path');

/**
 * Échappe les caractères spéciaux selon RFC 6868 et RFC 6350
 * @param {string} text - Texte à échapper
 * @returns {string} - Texte échappé
 */
function escapeVCardText(text) {
  if (!text) return '';
  
  let escaped = String(text);
  
  // RFC 6868 : Échappement avec ^
  // ^n → nouvelle ligne
  escaped = escaped.replace(/\r\n/g, '^n');  // CRLF
  escaped = escaped.replace(/\n/g, '^n');   // LF seul
  escaped = escaped.replace(/\r/g, '^n');   // CR seul
  
  // ^^ → caractère ^
  escaped = escaped.replace(/\^/g, '^^');
  
  // ^' → apostrophe
  escaped = escaped.replace(/'/g, "^'");
  
  // RFC 6350 : Échappement avec \
  // \\ → backslash (doit être fait en premier)
  escaped = escaped.replace(/\\/g, '\\\\');
  
  // \, → virgule
  escaped = escaped.replace(/,/g, '\\,');
  
  // \; → point-virgule
  escaped = escaped.replace(/;/g, '\\;');
  
  // Espaces en début de ligne
  if (escaped.startsWith(' ')) {
    escaped = '\\ ' + escaped.substring(1);
  }
  
  // Espaces en fin de ligne
  if (escaped.endsWith(' ')) {
    escaped = escaped.substring(0, escaped.length - 1) + '\\ ';
  }
  
  return escaped;
}

/**
 * Valide les données d'entrée pour la génération de VCard
 * @param {Object} data - Données de l'enseignant
 * @param {string} data.nom - Nom de l'enseignant
 * @param {string} data.prenom - Prénom de l'enseignant
 * @param {string} data.email - Email de l'enseignant
 * @param {string} data.etablissement - Établissement
 * @param {string} data.matiere - Matière enseignée
 * @throws {Error} Si les données sont invalides
 */
function validateVCardData(data) {
  if (!data || typeof data !== 'object') {
    throw new Error('Les données doivent être un objet');
  }
  
  const requiredFields = ['nom', 'prenom', 'email', 'etablissement', 'matiere'];
  const missingFields = [];
  
  for (const field of requiredFields) {
    if (!data[field] || String(data[field]).trim() === '') {
      missingFields.push(field);
    }
  }
  
  if (missingFields.length > 0) {
    throw new Error(`Champs obligatoires manquants: ${missingFields.join(', ')}`);
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    throw new Error(`Format d'email invalide: ${data.email}`);
  }
  
  const maxLength = 255;
  for (const field of requiredFields) {
    if (String(data[field]).length > maxLength) {
      throw new Error(`Le champ '${field}' est trop long (maximum ${maxLength} caractères)`);
    }
  }
}

/**
 * Construit le contenu VCard selon RFC 6350
 * @param {Object} data - Données de l'enseignant
 * @param {string} data.nom - Nom de l'enseignant
 * @param {string} data.prenom - Prénom de l'enseignant
 * @param {string} data.email - Email de l'enseignant
 * @param {string} data.etablissement - Établissement
 * @param {string} data.matiere - Matière enseignée
 * @returns {string} - Contenu VCard complet avec CRLF
 */
function buildVCardContent(data) {
  const lines = [];
  
  lines.push('BEGIN:VCARD');
  lines.push('VERSION:3.0');
  
  const fullName = `${data.prenom} ${data.nom}`;
  lines.push(`FN:${escapeVCardText(fullName)}`);
  lines.push(`N:${escapeVCardText(data.nom)};${escapeVCardText(data.prenom)};;;`);
  lines.push(`EMAIL;TYPE=INTERNET:${escapeVCardText(data.email)}`);
  lines.push(`ORG:${escapeVCardText(data.etablissement)}`);
  lines.push(`CATEGORIES:${escapeVCardText(data.matiere)}`);
  
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const day = String(now.getUTCDate()).padStart(2, '0');
  const hours = String(now.getUTCHours()).padStart(2, '0');
  const minutes = String(now.getUTCMinutes()).padStart(2, '0');
  const seconds = String(now.getUTCSeconds()).padStart(2, '0');
  const revDate = `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
  lines.push(`REV:${revDate}`);
  
  lines.push('END:VCARD');
  return lines.join('\r\n') + '\r\n';
}

/**
 * Génère une VCard conforme aux normes RFC 6350 & RFC 6868
 * @param {Object} data - Données de l'enseignant
 * @param {string} data.nom - Nom de l'enseignant
 * @param {string} data.prenom - Prénom de l'enseignant
 * @param {string} data.email - Email de l'enseignant
 * @param {string} data.etablissement - Établissement
 * @param {string} data.matiere - Matière enseignée
 * @param {string} outputFile - Chemin du fichier de sortie
 * @throws {Error} Si la génération échoue
 */
function generateVCard(data, outputFile) {
    validateVCardData(data);
    const normalizedOutputFile = path.resolve(outputFile);
    const vcardContent = buildVCardContent(data);
    
    try {
      const outputDir = path.dirname(normalizedOutputFile);
      if (outputDir && outputDir !== '.' && outputDir !== path.dirname('.')) {
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }
      }
      
      fs.writeFileSync(normalizedOutputFile, vcardContent, { encoding: 'utf8' });
    } catch (error) {
      throw new Error(`Impossible d'écrire le fichier ${normalizedOutputFile}: ${error.message}`);
    }
  }

module.exports = {
  generateVCard,
  escapeVCardText,
  validateVCardData,
  buildVCardContent
};
