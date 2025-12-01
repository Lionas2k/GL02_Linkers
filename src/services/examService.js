const fs = require("fs");
const readline = require("readline");
const CollectionQuestion = require("../model/CollectionQuestion");

class ExamService {

    /**
     * Construit un examen à partir d'une liste de questions
     * et génère un fichier GIFT.
     *
     * @param {Array} questions - tableau d'objets Question
     * @param {string} outputPath - chemin du fichier .gift
     * @returns {CollectionQuestion}
     */
    buildExam(questions, outputPath) {
        const exam = new CollectionQuestion();

        // Ajouter les questions sans doublons
        questions.forEach(q => {
            if (!exam.contains(q)) {
                exam.addQuestion(q);
            }
        });

        // Vérifier si l'examen est valide
        if (!exam.isValidExam()) {
            throw new Error("Invalid exam: must contain 15–20 unique questions.");
        }

        // On part du principe que Alexis fournira q.raw
        const content = exam.getAll()
            .map(q => q.raw)
            .join("\n\n");

        fs.writeFileSync(outputPath, content, "utf8");

        return exam;
    }

    /**
     * Simule la passation d'un examen en CLI
     */
    async simulateExam(questions) {
        const responses = [];

        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        const ask = (text) => {
            return new Promise(resolve => {
                rl.question(text, answer => {
                    resolve(answer.trim());
                });
            });
        };

        for (const q of questions) {
            console.log("\n==============================");
            console.log("Question :");
            console.log(q.text);

            const answer = await ask("Votre réponse : ");
            responses.push({
                questionId: q.id,
                userAnswer: answer
            });
        }

        rl.close();
        return responses;
    }

    /**
     * Analyse les réponses d'un examen
     */
    analyzeExam(questions, responses) {
        let score = 0;
        const details = [];

        responses.forEach(res => {
            const q = questions.find(q => q.id === res.questionId);

            if (!q) {
                details.push({
                    questionId: res.questionId,
                    error: "Question not found"
                });
                return;
            }

            const isCorrect = q.isCorrect(res.userAnswer);

            if (isCorrect) {
                score++;
            }

            details.push({
                questionId: q.id,
                questionText: q.text,
                userAnswer: res.userAnswer,
                correct: isCorrect
            });
        });

        const total = questions.length;

        return {
            score,
            total,
            percent: total > 0 ? (score / total) * 100 : 0,
            details
        };
    }
}

module.exports = new ExamService();
