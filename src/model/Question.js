class Question {
  constructor(id, enonce, type, reponses, raw = null) {
    this.id = id;
    this.enonce = enonce;
    this.type = type;
    this.reponses = reponses;
    this.raw = raw; // Texte GIFT original de la question
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

  /**
   * Vérifie si une réponse donnée correspond à une réponse correcte
   * @param {string} answer - La réponse à vérifier
   * @return {boolean} true si la réponse est correcte, false sinon
   */
  isCorrect(answer) {
    if (!answer) {
      return false;
    }

    const normalizedAnswer = answer.trim();

    // Pour les questions de type TRUE/FALSE
    if (this.type === "TF") {
      const correctAnswers = this.getBonnesReponses();
      if (correctAnswers.length > 0) {
        return normalizedAnswer.toUpperCase() === correctAnswers[0].resp.toUpperCase();
      }
      return false;
    }

    // Pour les questions de type MATCHING
    if (this.type === "MATCH") {
      // Format attendu : "item1 -> item2" ou juste "item2"
      const correctAnswers = this.getBonnesReponses();
      return correctAnswers.some(correct => {
        if (correct.assoc) {
          // Format complet avec association
          const matchPattern = `${correct.resp} -> ${correct.assoc}`;
          return normalizedAnswer === matchPattern || normalizedAnswer === correct.assoc;
        }
        return normalizedAnswer === correct.resp;
      });
    }

    // Pour les questions MCQ et SA (réponses courtes)
    const correctAnswers = this.getBonnesReponses();
    if (correctAnswers.length === 0) {
      return false;
    }
    return correctAnswers.some(correct => {
      // Comparaison insensible à la casse pour SA et MCQ
      return normalizedAnswer.toLowerCase() === correct.resp.toLowerCase();
    });

    // Pour les questions ESSAY, aucune réponse n'est considérée comme correcte automatiquement
    // (nécessite une évaluation manuelle)
    // Le return false implicite à la fin de la fonction gère ce cas
  }
}

module.exports = Question;
