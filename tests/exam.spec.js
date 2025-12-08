const fs = require("fs");
const path = require("path");
const ExamService = require("../src/services/examService");

describe("ExamService", () => {
    const outputExamFile = path.join(__dirname, "../data/testExam.gift");

    // 👉 Nettoyer le fichier généré après les tests
    afterAll(() => {
        if (fs.existsSync(outputExamFile)) {
            fs.unlinkSync(outputExamFile);
        }
    });

    test("should throw for invalid exam", () => {
        const questions = []; // 0 question = examen invalide
        expect(() => ExamService.buildExam(questions, outputExamFile))
            .toThrow("Invalid exam: must contain 15–20 unique questions.");
    });

    test("should build exam successfully with 15 questions", () => {
        const questions = [];

        // 👉 Simulation de 15 questions valides avec raw GIFT
        for (let i = 0; i < 15; i++) {
            questions.push({
                id: `Q${i}`,
                raw: `::Q${i}:: What? { =Yes }`
            });
        }

        const exam = ExamService.buildExam(questions, outputExamFile);

        // Vérifications
        expect(exam).toBeDefined();
        expect(exam.size()).toBe(15);
        expect(exam.isValidExam()).toBe(true);

        // Le fichier doit exister
        expect(fs.existsSync(outputExamFile)).toBe(true);

        // Le contenu doit contenir les 15 questions
        const content = fs.readFileSync(outputExamFile, "utf8");
        const count = (content.match(/::/g) || []).length / 2;
        expect(count).toBe(15);
    });
});
