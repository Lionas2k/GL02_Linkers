const GIFTParser = require("../src/parser/GIFTParser");

describe("GIFTParser", () => {
  test("Parse MATCH question", () => {
    const parser = new GIFTParser();
    const giftData = `::Q1:: Match the following: { 
        =Apple -> Fruit
        =Carrot -> Vegetable
        =Dog -> Animal
        }`;
    parser.parse(giftData);
    const question = parser.parsedQuestions[0];

    expect(question.type).toBe("MATCH");
    expect(question.enonce).toBe("Match the following:");
    expect(question.reponses).toEqual(["Apple", "Carrot", "Dog"]);
    expect(question.bonneReponses).toEqual(["Fruit", "Vegetable", "Animal"]);
  });

  test("Parse TRUE/FALSE question", () => {
    const parser = new GIFTParser();
    const giftData = `
        ::Q2:: Is the sky blue? {
        TRUE
        }
        `;
    parser.parse(giftData);
    const question = parser.parsedQuestions[0];

    expect(question.type).toBe("TF");
    expect(question.enonce).toBe("Is the sky blue?");
    expect(question.reponses).toEqual(["TRUE", "FALSE"]);
    expect(question.bonneReponses).toEqual(["TRUE"]);
  });

  test("Parse ESSAY question", () => {
    const parser = new GIFTParser();
    const giftData = `
        ::Q3:: Describe the water cycle.
        { }
        `;
    parser.parse(giftData);
    const question = parser.parsedQuestions[0];

    expect(question.type).toBe("ESSAY");
    expect(question.enonce).toBe("Describe the water cycle.");
    expect(question.reponses).toEqual([]);
  });

  test("Parse SA question", () => {
    const parser = new GIFTParser();
    const giftData = `
        ::Q4:: What is the capital of France?
        {
        =Paris
        }
        `;
    parser.parse(giftData);
    const question = parser.parsedQuestions[0];

    expect(question.type).toBe("SA");
    expect(question.enonce).toBe("What is the capital of France?");
    expect(question.reponses).toEqual(["Paris"]);
    expect(question.bonneReponses).toEqual(["Paris"]);
  });

  test("Parse MC question", () => {
    const parser = new GIFTParser();
    const giftData = `::Q5:: What is 2 + 2?{
    =4
    ~3
    ~5
    }`;
    parser.parse(giftData);
    const question = parser.parsedQuestions[0];

    expect(question.type).toBe("MC");
    expect(question.enonce).toBe("What is 2 + 2?");
    expect(question.reponses).toEqual(["4", "3", "5"]);
    expect(question.bonneReponses).toEqual(["4"]);
  });

  test("Parse MULTIPLE question type", () => {
    const parser = new GIFTParser();
    const giftData = `
    ::Q1:: What is 2 + 2?{
    =4
    ~3
    ~5
    }

    ::Q2:: Is the sky blue? 
    {
        TRUE
    }

    ::Q3:: Describe the water cycle.
    { }
        `;
    parser.parse(giftData);
    const question1 = parser.parsedQuestions[0];
    const question2 = parser.parsedQuestions[1];
    const question3 = parser.parsedQuestions[2];

    expect(question1.type).toBe("MC");
    expect(question2.type).toBe("TF");
    expect(question3.type).toBe("ESSAY");
  });
});
