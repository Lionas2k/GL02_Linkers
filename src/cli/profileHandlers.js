const { buildProfile, printHistogram, compareProfiles } = require("../services/profileService");
const parser = require("../parser/GIFTParser");

/**
 *  Command : profile show <file>
 *  Show the profile of a given file
 */
async function handleProfileShow({ file }) {
  const questions = await parser.parseFile(file);
  const profile = buildProfile(questions);
  console.log("Profil du test :");
  console.log(profile);
}

/**
 *  Command : profile histogram <file>
 *  Show the histogram of question types for a given file
 */
async function handleHistogram({ file }) {
  const questions = await parser.parseFile(file);
  const profile = buildProfile(questions);
  printHistogram(profile, { width: 30, barChar: "█" });
}

/**
 *  Command : profile compare <exam> <bank>
 *  Compare the profile of an exam file with a question bank file or another exam file
 */
async function handleCompare({ exam, bank }) {
  const qExam = await parser.parseFile(exam);
  const qBank = await parser.parseFile(bank);

  const pExam = buildProfile(qExam);
  const pBank = buildProfile(qBank);

  const result = compareProfiles(pExam, pBank);

  console.log(`Similarité exam vs banque : ${result.similarity}%`);
  console.table(result.diffs);
}

module.exports = {
  handleProfileShow,
  handleHistogram,
  handleCompare
};
