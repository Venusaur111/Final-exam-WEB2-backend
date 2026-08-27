export interface Answer {
    id: string;
    attemptId: string;
    questionId: string;
    choiceId: string | null; // RG-05 : question laissée sans réponse
}

// Ligne de correction affichée à l'étudiant après soumission (RG-12)
export interface AnswerCorrection {
    questionId: string;
    statement: string;
    points: number;
    chosenChoiceId: string | null;
    correctChoiceId: string;
    isCorrect: boolean;
    earnedPoints: number;
}

export interface ExamCorrection {
    attemptId: string;
    examId: string;
    score: number;
    maxScore: number;
    corrections: AnswerCorrection[];
}