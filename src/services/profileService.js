/**
 * MC = QCM 
 * SA = Question à réponse courte
 * TF = Vrai/Faux
 * MATCH = Associer les paires
 * NUMERIC = Réponse numérique
 * CLOZE = Texte à trous
 * OPEN = Question ouverte
 * OTHER = Autre type
 */
const DEFAULT_TYPES = ['MC','SA', 'TF','MATCH','NUMERIC','CLOZE','OPEN','OTHER'];

/** 
 * Build the profile of a test from a list of questions
 *  questions : liste de questions
 *  Return a profile object containing : 
 *  total: total number of questions
 *  counts: number of questions per type
 *  percents: percentage of questions per type
 */
function buildProfile(questions, knownTypes = DEFAULT_TYPES) {
  const counts = Object.fromEntries(knownTypes.map(t => [t, 0]));
  let other = 0;
  for (const q of questions) {
    const t = (q.type || 'OTHER').toString().toUpperCase();
    if (t in counts) counts[t]++;
    else {
      other++;
      counts.OTHER = (counts.OTHER || 0) + 1;
    }
  }
  const total = questions.length;
  const percents = {};
  for (const k of Object.keys(counts)) {
    percents[k] = total === 0 ? 0 : (counts[k] / total) * 100;
  }
  return { total, counts, percents };
}

/**
 *  Read a profile and print an ASCII histogram to the console
 *  options: width and barChar customizable
 *  Return the ASCII histogram as a string
 */
function printHistogram(profile, options = {}) {
  const { width = 30, barChar = '█' } = options;
  const lines = [];
  // Take the max count to scale the bars
  const maxCount = Math.max(...Object.values(profile.counts), 1);
  for (const [type, count] of Object.entries(profile.counts)) {
    const barLen = Math.round((count / maxCount) * width);
    const bar = barChar.repeat(barLen || 0);
    lines.push(`${type.padEnd(8)} ${bar} ${count}`);
  }
  const out = lines.join('\n');
  console.log(out);
  return out;
}

/**
 *  Compare two profiles of tests and return a similarity score and differences
 *  pA, pB: the two profiles to compare
 *  Method : we compare the profiles based on their type distributions in percentages and return a similarity score from 0 to 100
 *  We use the normalized L1 distance: sum = (1 - 0.5 * sum |pAi - pBi|) * 100
 *  |pAi - pBi| : absolute difference between percentages of type i in profiles A and B
 *  sum |pAi - pBi| : sum of absolute differences for all types i
 *  The sum is normalized between 0 and 2 (0 = identical profiles, 2 = completely different profiles)
 *  We convert it to a similarity score between 0 and 100 by computing (1 - sum/2) * 100
 */
function compareProfiles(pA, pB) {
  const keys = Array.from(new Set([...Object.keys(pA.percents), ...Object.keys(pB.percents)]));
  let sumAbs = 0;
  for (const k of keys) {
    const a = pA.percents[k] || 0;
    const b = pB.percents[k] || 0;
    sumAbs += Math.abs(a - b) / 100; // Convert percent to fraction
  }
  // sumAbs in [0, 2] => normalized similarity
  const similarity = Math.max(0, (1 - (sumAbs / 2))) * 100;
  // Also prepare a differences object for reporting
  const diffs = {};
  for (const k of keys) {
    diffs[k] = {
      a: pA.counts[k] || 0,
      b: pB.counts[k] || 0,
      diffPercent: ( (pA.percents[k] || 0) - (pB.percents[k] || 0) )
    };
  }
  return { similarity: Math.round(similarity * 100) / 100, diffs }; // Similarity in percent rounded to 2 decimals
}

module.exports = { buildProfile, printHistogram, compareProfiles, DEFAULT_TYPES };
