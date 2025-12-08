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
  // Vérifier que data existe
  if (!data || typeof data !== 'object') {
    throw new Error('Les données doivent être un objet');
  }
  
  // Vérifier les champs obligatoires
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
  
  // Valider le format de l'email (regex simple)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    throw new Error(`Format d'email invalide: ${data.email}`);
  }
  
  // Vérifier que les valeurs ne sont pas trop longues (recommandation RFC)
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
  
  // BEGIN:VCARD (obligatoire)
  lines.push('BEGIN:VCARD');
  
  // VERSION:3.0 (obligatoire)
  lines.push('VERSION:3.0');
  
  // FN (Full Name - obligatoire)
  // Format: Prénom Nom
  const fullName = `${data.prenom} ${data.nom}`;
  lines.push(`FN:${escapeVCardText(fullName)}`);
  
  // N (Name - nom structuré)
  // Format: N:Family;Given;Additional;Prefix;Suffix
  // Ici: N:Nom;Prénom;;;
  lines.push(`N:${escapeVCardText(data.nom)};${escapeVCardText(data.prenom)};;;`);
  
  // EMAIL (obligatoire pour SPEC_3)
  // Format: EMAIL;TYPE=INTERNET:email
  lines.push(`EMAIL;TYPE=INTERNET:${escapeVCardText(data.email)}`);
  
  // ORG (Organization - établissement)
  // Format: ORG:nom
  lines.push(`ORG:${escapeVCardText(data.etablissement)}`);
  
  // CATEGORIES (matière enseignée)
  // Format: CATEGORIES:matière
  lines.push(`CATEGORIES:${escapeVCardText(data.matiere)}`);
  
  // REV (Revision - date de création)
  // Format: REV:YYYYMMDDTHHMMSSZ (ISO 8601)
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const day = String(now.getUTCDate()).padStart(2, '0');
  const hours = String(now.getUTCHours()).padStart(2, '0');
  const minutes = String(now.getUTCMinutes()).padStart(2, '0');
  const seconds = String(now.getUTCSeconds()).padStart(2, '0');
  const revDate = `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
  lines.push(`REV:${revDate}`);
  
  // END:VCARD (obligatoire)
  lines.push('END:VCARD');
  
  // Joindre toutes les lignes avec CRLF (\r\n)
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
    // Valider les données
    validateVCardData(data);
    
    // Normaliser le chemin de sortie
    const normalizedOutputFile = path.resolve(outputFile);
    
    // Construire le contenu VCard
    const vcardContent = buildVCardContent(data);
    
    // Écrire le fichier
    try {
      // Créer le répertoire parent si nécessaire
      const outputDir = path.dirname(normalizedOutputFile);
      if (outputDir && outputDir !== '.' && outputDir !== path.dirname('.')) {
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }
      }
      
      // Écrire le fichier en UTF-8 avec CRLF
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

