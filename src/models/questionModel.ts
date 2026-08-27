import { Choice, ChoiceForStudent, CreateChoiceInput } from "./choice.js";

export interface Question {
    id: string;
    examId: string;
    statement: string;
    points: number;
    createdAt: Date;
}

// Vue admin : question + choix, is_correct visible
export interface QuestionWithChoices extends Question {
    choices: Choice[];
}

// Vue étudiant (RG-07) : is_correct JAMAIS présent
export interface QuestionForStudent {
    id: string;
    statement: string;
    points: number;
    choices: ChoiceForStudent[];
}

export interface CreateQuestionInput {
    statement: string;
    points: number;
    choices: CreateChoiceInput[]; // entre 2 et 6, exactement un correct (RG-04)
}

export interface UpdateQuestionInput {
    statement?: string;
    points?: number;
    choices?: CreateChoiceInput[]; // remplace l'ensemble des choix si fourni
}