class CollectionQuestion {
  constructor() {
    this.questions = [];
  }

  addQuestion(question) {
    this.questions.push(question);
  }

  getQuestionById(id) {
    return this.questions.find((question) => question.getId() === id);
  }

  getQuestions() {
    return this.questions;
  }

  removeQuestionById(id) {
    this.questions = this.questions.filter(
      (question) => question.getId() !== id
    );
  }

  getNumberOfQuestions() {
    return this.questions.length;
  }

  containsQuestion(id) {
    return this.questions.some((question) => question.getId() === id);
  }

  isValidExam() {
    if (this.getNumberOfQuestions() < 15 || this.getNumberOfQuestions() > 20) {
      return false;
    }

    let isValid = false;

    for (let question of this.questions) {
      // TO DO
    }
    return true;
  }
}
