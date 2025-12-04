class Question {
  constructor(id, enonce, type, reponses) {
    this.id = id;
    this.enonce = enonce;
    this.type = type;
    this.reponses = reponses;
  }

  /**
   * Retourne l'id de la question
   * @return {number} L'id de la question
   */
  getId() {
    return this.id;
  }

  /**
   * Retourne le texte de la question
   * @return {string} Le texte de la question
   */
  getTexte() {
    return this.enonce;
  }

  /**
   * Retourne le type de la question
   * @return {string} Le type de la question
   */
  getType() {
    return this.type;
  }

  /**
   * Retourne les réponses de la question
   * @return {Array} Les réponses
   */
  getResponse() {
    return this.reponses;
  }

  /**
   * Retourne les bonnes réponses de la question
   * @return {Array} Les bonnes réponses
   */
  getBonnesReponses() {
    return this.reponses.filter((r) => r.isCorrect);
  }

  /**
   * Permet de comparer deux questions et de savoir si elles sont identiques
   * @param question - La question à comparer
   * @return {boolean} true si les questions sont identiques, false sinon
   */
  sameQuestion(question) {
    return (
      this.id === question.id &&
      this.enonce === question.enonce &&
      this.type === question.type &&
      this.reponses.length === question.reponses.length &&
      this.reponses.every(
        (r, index) => r.resp === question.reponses[index].resp
      )
    );
  }
}

module.exports = Question;
