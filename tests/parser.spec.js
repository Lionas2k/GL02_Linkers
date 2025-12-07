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
    expect(question.reponses.length).toBe(3);
    expect(question.reponses[0].resp).toBe("Apple");
    expect(question.reponses[0].assoc).toBe("Fruit");
    expect(question.reponses[1].resp).toBe("Carrot");
    expect(question.reponses[1].assoc).toBe("Vegetable");
    expect(question.reponses[2].resp).toBe("Dog");
    expect(question.reponses[2].assoc).toBe("Animal");
    
    const bonnesReponses = question.getBonnesReponses();
    expect(bonnesReponses.length).toBe(3);
    expect(bonnesReponses[0].assoc).toBe("Fruit");
    expect(bonnesReponses[1].assoc).toBe("Vegetable");
    expect(bonnesReponses[2].assoc).toBe("Animal");
    
    // Vérifier que raw est présent
    expect(question.raw).toBeDefined();
    expect(question.raw).toContain("Q1");
    expect(question.raw).toContain("Match the following:");
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
    expect(question.reponses.length).toBe(1);
    expect(question.reponses[0].resp).toBe("TRUE");
    expect(question.reponses[0].isCorrect).toBe(true);
    
    const bonnesReponses = question.getBonnesReponses();
    expect(bonnesReponses.length).toBe(1);
    expect(bonnesReponses[0].resp).toBe("TRUE");
    
    // Vérifier que raw est présent
    expect(question.raw).toBeDefined();
    expect(question.raw).toContain("Q2");
    expect(question.raw).toContain("Is the sky blue?");
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
    expect(question.raw).toBeDefined();
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
    expect(question.reponses.length).toBe(1);
    expect(question.reponses[0].resp).toBe("Paris");
    expect(question.reponses[0].isCorrect).toBe(true);
    
    const bonnesReponses = question.getBonnesReponses();
    expect(bonnesReponses.length).toBe(1);
    expect(bonnesReponses[0].resp).toBe("Paris");
    
    // Vérifier que raw est présent
    expect(question.raw).toBeDefined();
    expect(question.raw).toContain("Q4");
    expect(question.raw).toContain("capital of France");
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
    expect(question.reponses.length).toBe(3);
    expect(question.reponses[0].resp).toBe("4");
    expect(question.reponses[0].isCorrect).toBe(true);
    expect(question.reponses[1].resp).toBe("3");
    expect(question.reponses[1].isCorrect).toBe(false);
    expect(question.reponses[2].resp).toBe("5");
    expect(question.reponses[2].isCorrect).toBe(false);
    
    const bonnesReponses = question.getBonnesReponses();
    expect(bonnesReponses.length).toBe(1);
    expect(bonnesReponses[0].resp).toBe("4");
    
    // Vérifier que raw est présent
    expect(question.raw).toBeDefined();
    expect(question.raw).toContain("Q5");
    expect(question.raw).toContain("2 + 2");
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
    
    // Vérifier que raw est présent pour toutes les questions
    expect(question1.raw).toBeDefined();
    expect(question2.raw).toBeDefined();
    expect(question3.raw).toBeDefined();
  });
});
