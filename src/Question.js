class Question {
  constructor(enonce, typeQuestion, listReponse) {
    this.id = this.generateId();
    this.enonce = enonce;
    this.typeQuestion = typeQuestion;
    this.listReponse = listReponse;
  }

  generateId() {
    return "q_" + Math.random().toString(36).slice(2, 10);
  }

  getId() {
    return this.id;
  }

  getEnonce() {
    return this.enonce;
  }

  getTypeQuestion() {
    return this.typeQuestion;
  }

  getListReponse() {
    return this.listReponse;
  }

  sameQuestion(questionAVerifier) {
    if (
      this.getEnonce() === questionAVerifier.getEnonce() &&
      this.getTypeQuestion() === questionAVerifier.getTypeQuestion() &&
      this.getListReponse().length === questionAVerifier.getListReponse().length
    ) {
      return true;
    }
    return false;
  }
}
