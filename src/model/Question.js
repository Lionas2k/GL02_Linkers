class Question {
  constructor() {
    this.id = null;
    this.enonce = "";
    this.type = "";
    this.reponses = [];
    this.bonneReponses = [];
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
   * Retourne les réponses de la question
   * @return {Array} Les bonnes réponses
   */
  getBonnesReponses() {
    return this.bonneReponses;
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
      this.reponses.every((r, index) => r === question.reponses[index])
    );
  }

  /**
   * Permet de savoir si les réponses données sont correctes
   * Pour cela, on compare les index des réponses données avec les index des bonnes réponses
   * @param indexReponses - Les index des réponses données
   * @return {boolean} true si les réponses sont correctes, false sinon
   */
  isCorrect(indexReponses) {
    return indexReponses.every((index) => this.bonneReponses.includes(index));
  }
}

module.exports = Question;
