const CollectionQuestion = require("../src/model/CollectionQuestion");

describe("CollectionQuestion", () => {
    
    test("should add questions", () => {
        const c = new CollectionQuestion();
        c.addQuestion({ id: 1 });
        c.addQuestion({ id: 2 });

        expect(c.size()).toBe(2);
    });

    test("should remove questions", () => {
        const c = new CollectionQuestion();
        c.addQuestion({ id: 1 });
        c.removeQuestion(1);

        expect(c.size()).toBe(0);
    });

    test("should detect duplicates", () => {
        const c = new CollectionQuestion();
        c.addQuestion({ id: 1 });

        expect(c.contains({ id: 1 })).toBe(true);
        expect(c.contains({ id: 2 })).toBe(false);
    });

    test("should validate exam only between 15 and 20 questions", () => {
        const c = new CollectionQuestion();

        for (let i = 0; i < 10; i++) {
            c.addQuestion({ id: i });
        }

        expect(c.isValidExam()).toBe(false);

        for (let i = 10; i < 25; i++) {
            c.addQuestion({ id: i });
        }

        expect(c.isValidExam()).toBe(false);
    });

    test("should validate exam with 15 unique questions", () => {
        const c = new CollectionQuestion();

        for (let i = 0; i < 15; i++) {
            c.addQuestion({ id: i });
        }

        expect(c.isValidExam()).toBe(true);
    });
});
