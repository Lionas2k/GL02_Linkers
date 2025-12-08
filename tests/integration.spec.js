const fs = require("fs");
const path = require("path");
const GIFTParser = require("../src/parser/GIFTParser");
const ExamService = require("../src/services/examService");

describe("Test d'intégration complet - Pipeline Examens", () => {
  const testGiftFile = path.join(__dirname, "../data/testQuestions.gift");
  const tempDir = path.join(__dirname, "temp");
  const outputExamFile = path.join(tempDir, "generatedExam.gift");

  // Créer le dossier temporaire avant tous les tests
  beforeAll(() => {
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
  });

  // Nettoyer les fichiers générés après chaque test
  afterEach(() => {
    if (fs.existsSync(outputExamFile)) {
      fs.unlinkSync(outputExamFile);
    }
  });

  // Nettoyer le dossier temporaire après tous les tests
  afterAll(() => {
    if (fs.existsSync(tempDir)) {
      const files = fs.readdirSync(tempDir);
      files.forEach(file => {
        fs.unlinkSync(path.join(tempDir, file));
      });
      fs.rmdirSync(tempDir);
    }
  });

  test("Pipeline complet: parse → buildExam → simulate → analyze", () => {
    // Étape 1: Parser un fichier GIFT
    const giftContent = fs.readFileSync(testGiftFile, "utf8");
    const parser = new GIFTParser();
    parser.parse(giftContent);

    expect(parser.parsedQuestions.length).toBeGreaterThan(0);
    expect(parser.errorCount).toBe(0);

    // Vérifier que chaque question a un raw
    parser.parsedQuestions.forEach((q, index) => {
      expect(q.raw).toBeDefined();
      expect(q.raw).not.toBeNull();
      expect(typeof q.raw).toBe("string");
      expect(q.raw.length).toBeGreaterThan(0);
      expect(q.raw).toContain("::");
    });

    // Étape 2: Récupérer les 15 premières questions
    const questionsForExam = parser.parsedQuestions.slice(0, 15);

    expect(questionsForExam.length).toBe(15);

    // Vérifier que toutes les questions ont un id unique
    const ids = questionsForExam.map(q => q.id || q.getId());
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(15);

    // Étape 3: Construire un examen GIFT via buildExam()
    const exam = ExamService.buildExam(questionsForExam, outputExamFile);

    expect(exam).toBeDefined();
    expect(exam.size()).toBe(15);
    expect(exam.isValidExam()).toBe(true);

    // Vérifier que le fichier a été créé
    expect(fs.existsSync(outputExamFile)).toBe(true);

    // Vérifier le contenu du fichier généré
    const generatedContent = fs.readFileSync(outputExamFile, "utf8");
    expect(generatedContent.length).toBeGreaterThan(0);
    expect(generatedContent).toContain("::");

    // Compter le nombre de questions dans le fichier généré
    const questionCount = (generatedContent.match(/::/g) || []).length / 2;
    expect(questionCount).toBe(15);

    // Étape 4: Simuler une session avec des réponses fictives
    // On ne peut pas vraiment simuler readline dans Jest, donc on crée directement les réponses
    const mockResponses = questionsForExam.map((q, index) => {
      // Générer des réponses fictives basées sur le type de question
      let userAnswer = "";

      if (q.type === "TF") {
        // Pour True/False, on répond TRUE pour les pairs, FALSE pour les impairs
        userAnswer = index % 2 === 0 ? "TRUE" : "FALSE";
      } else if (q.type === "MATCH") {
        // Pour Matching, on prend la première bonne réponse
        const correctAnswers = q.getBonnesReponses();
        if (correctAnswers.length > 0 && correctAnswers[0].assoc) {
          userAnswer = correctAnswers[0].assoc;
        }
      } else if (q.type === "ESSAY") {
        // Pour Essay, on met une réponse factice
        userAnswer = "Sample essay answer";
      } else {
        // Pour MCQ et SA, on prend la première bonne réponse
        const correctAnswers = q.getBonnesReponses();
        if (correctAnswers.length > 0) {
          userAnswer = correctAnswers[0].resp;
        } else {
          userAnswer = "Unknown answer";
        }
      }

      return {
        questionId: q.id || q.getId(),
        userAnswer: userAnswer
      };
    });

    expect(mockResponses.length).toBe(15);

    // Étape 5: Analyser les réponses avec analyzeExam()
    const analysis = ExamService.analyzeExam(questionsForExam, mockResponses);

    expect(analysis).toBeDefined();
    expect(analysis.score).toBeDefined();
    expect(analysis.total).toBe(15);
    expect(analysis.percent).toBeDefined();
    expect(analysis.details).toBeDefined();
    expect(analysis.details.length).toBe(15);

    // Vérifier la cohérence du score
    expect(analysis.score).toBeGreaterThanOrEqual(0);
    expect(analysis.score).toBeLessThanOrEqual(15);
    expect(analysis.percent).toBeGreaterThanOrEqual(0);
    expect(analysis.percent).toBeLessThanOrEqual(100);

    // Vérifier que chaque détail a les bonnes propriétés
    analysis.details.forEach((detail, index) => {
      expect(detail.questionId).toBeDefined();
      expect(detail.questionText).toBeDefined();
      expect(detail.userAnswer).toBeDefined();
      expect(detail.correct).toBeDefined();
      expect(typeof detail.correct).toBe("boolean");
      expect(detail.error).toBeUndefined(); // Pas d'erreur attendue
    });

    // Vérifier que le score correspond au nombre de réponses correctes
    const expectedScore = analysis.details.filter(d => d.correct).length;
    expect(analysis.score).toBe(expectedScore);
  });

  test("Vérifier que isCorrect() fonctionne correctement", () => {
    const giftContent = fs.readFileSync(testGiftFile, "utf8");
    const parser = new GIFTParser();
    parser.parse(giftContent);

    // Tester avec une question MCQ
    const mcqQuestion = parser.parsedQuestions.find(q => q.type === "MC");
    if (mcqQuestion) {
      const correctAnswers = mcqQuestion.getBonnesReponses();
      if (correctAnswers.length > 0) {
        const correctAnswer = correctAnswers[0].resp;
        expect(mcqQuestion.isCorrect(correctAnswer)).toBe(true);
        expect(mcqQuestion.isCorrect("Wrong answer")).toBe(false);
      }
    }

    // Tester avec une question True/False
    const tfQuestion = parser.parsedQuestions.find(q => q.type === "TF");
    if (tfQuestion) {
      const correctAnswers = tfQuestion.getBonnesReponses();
      if (correctAnswers.length > 0) {
        const correctAnswer = correctAnswers[0].resp;
        expect(tfQuestion.isCorrect(correctAnswer)).toBe(true);
        expect(tfQuestion.isCorrect(correctAnswer.toLowerCase())).toBe(true); // Insensible à la casse
      }
    }

    // Tester avec une question Short Answer
    const saQuestion = parser.parsedQuestions.find(q => q.type === "SA");
    if (saQuestion) {
      const correctAnswers = saQuestion.getBonnesReponses();
      if (correctAnswers.length > 0) {
        const correctAnswer = correctAnswers[0].resp;
        expect(saQuestion.isCorrect(correctAnswer)).toBe(true);
        expect(saQuestion.isCorrect(correctAnswer.toLowerCase())).toBe(true); // Insensible à la casse
      }
    }
  });

  test("Vérifier que le raw GIFT peut être re-parsé", () => {
    const giftContent = fs.readFileSync(testGiftFile, "utf8");
    const parser1 = new GIFTParser();
    parser1.parse(giftContent);

    // Prendre les 15 premières questions
    const questions = parser1.parsedQuestions.slice(0, 15);

    // Construire l'examen
    ExamService.buildExam(questions, outputExamFile);

    // Re-parser le fichier généré
    const generatedContent = fs.readFileSync(outputExamFile, "utf8");
    const parser2 = new GIFTParser();
    parser2.parse(generatedContent);

    // Vérifier que le nombre de questions est le même
    expect(parser2.parsedQuestions.length).toBe(15);

    // Vérifier que chaque question parsée a les bonnes propriétés
    parser2.parsedQuestions.forEach((q, index) => {
      expect(q.id).toBeDefined();
      expect(q.enonce).toBeDefined();
      expect(q.type).toBeDefined();
      expect(q.reponses).toBeDefined();
      expect(q.raw).toBeDefined();
    });
  });

  test("Vérifier la gestion des erreurs dans le pipeline", () => {
    // Test avec moins de 15 questions
    const giftContent = fs.readFileSync(testGiftFile, "utf8");
    const parser = new GIFTParser();
    parser.parse(giftContent);

    const tooFewQuestions = parser.parsedQuestions.slice(0, 10);

    expect(() => {
      ExamService.buildExam(tooFewQuestions, outputExamFile);
    }).toThrow("Invalid exam: must contain 15–20 unique questions.");

    // Test avec plus de 20 questions (si disponible)
    if (parser.parsedQuestions.length > 20) {
      const tooManyQuestions = parser.parsedQuestions.slice(0, 25);

      expect(() => {
        ExamService.buildExam(tooManyQuestions, outputExamFile);
      }).toThrow("Invalid exam: must contain 15–20 unique questions.");
    }
  });
});

