export interface Attempt {
    id: string;
    examId: string;
    studentId: string;
    score: number | null; // null tant que non soumis
    startedAt: Date;
    submittedAt: Date | null;
}

// Ce que le client envoie à la soumission (RG-06 : jamais de score ni de isCorrect)
export interface SubmitAnswerInput {
    questionId: string;
    choiceId: string | null; // null autorisé = question laissée sans réponse (RG-05)
}

export interface SubmitExamInput {
    answers: SubmitAnswerInput[];
}