export interface Choice {
    id: string;
    questionId: string;
    label: string;
    isCorrect: boolean;
}

// Vue exposée à l'étudiant (RG-07) : jamais isCorrect
export type ChoiceForStudent = Omit<Choice, "isCorrect">;

export interface CreateChoiceInput {
    label: string;
    isCorrect: boolean;
}