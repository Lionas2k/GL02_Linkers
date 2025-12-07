class CollectionQuestion {
    constructor() {
        // Tableau interne qui contient toutes les questions
        this.questions = [];
    }

    /**
     * Ajoute une question à la collection
     * @param {Object} question - Un objet Question avec au moins un id
     */
    addQuestion(question) {
        this.questions.push(question);
    }

    /**
     * Supprime une question à partir de son id
     * @param {string|number} id
     */
    removeQuestion(id) {
        this.questions = this.questions.filter(q => q.id !== id);
    }

    /**
     * Retourne le nombre total de questions
     */
    size() {
        return this.questions.length;
    }

    /**
     * Vérifie si une question est déjà présente (même id)
     * @param {Object} question
     */
    contains(question) {
        return this.questions.some(q => q.id === question.id);
    }

    /**
     * Retourne toutes les questions
     */
    getAll() {
        return this.questions;
    }

    /**
     * Récupère une question par son id
     */
    getById(id) {
        return this.questions.find(q => q.id === id) || null;
    }

    /**
     * Vérifie si la collection respecte les règles d'un examen valide :
     * - entre 15 et 20 questions
     * - aucune question en doublon
     */
    isValidExam() {
        const count = this.questions.length;

        if (count < 15 || count > 20) {
            return false;
        }

        const ids = this.questions.map(q => q.id);
        const uniqueIds = new Set(ids);

        return ids.length === uniqueIds.size;
    }
}

module.exports = CollectionQuestion;
