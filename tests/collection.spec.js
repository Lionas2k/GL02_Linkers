const CollectionQuestion = require("../src/model/CollectionQuestion");

describe("CollectionQuestion", () => {

    test("should add and count questions", () => {
        const cq = new CollectionQuestion();
        cq.addQuestion({ id: 1 });
        cq.addQuestion({ id: 2 });

        expect(cq.size()).toBe(2);
    });

    test("should detect duplicates", () => {
        const cq = new CollectionQuestion();
        cq.addQuestion({ id: 1 });

        expect(cq.contains({ id: 1 })).toBe(true);
        expect(cq.contains({ id: 2 })).toBe(false);
    });

    test("isValidExam should return false for less than 15 questions", () => {
        const cq = new CollectionQuestion();
        for (let i = 1; i <= 10; i++) cq.addQuestion({ id: i });

        expect(cq.isValidExam()).toBe(false);
    });
});
