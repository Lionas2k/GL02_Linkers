const ExamService = require("../src/services/examService");

describe("ExamService", () => {

    test("should throw for invalid exam", () => {
        const questions = []; // 0 question = invalide

        expect(() => 
            ExamService.buildExam(questions, "./out.gift")
        ).toThrow();
    });

    test("should build exam successfully with 15 questions", () => {
        const questions = [];

        for (let i = 0; i < 15; i++) {
            questions.push({
                id: i,
                raw: `::Q${i}:: What? { =Yes }` // simulé
            });
        }

        const exam = ExamService.buildExam(questions, "./testExam.gift");

        expect(exam.size()).toBe(15);
    });

});
