import {Question} from "../../questionModel.js";

export type ForStudentInExamQuestion = Omit<Question, 'id' | 'correctAnswerIndex'>;