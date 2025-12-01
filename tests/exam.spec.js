const ExamService = require("../src/services/examService");

describe("ExamService", () => {

    test("buildExam should throw when exam is invalid", () => {
        const questions = [];

        expect(() => ExamService.buildExam(questions, "out.gift"))
            .toThrow();
    });

});
