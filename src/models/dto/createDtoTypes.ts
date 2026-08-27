import { Choice } from '../choice.js';
import { Course } from '../courseModel.js';
import { Exam } from '../examModel.js';
import { Question } from '../questionModel.js';
import { User } from '../userModel.js';

export type CreateChoiceDto = Omit<Choice, 'id' | 'choiceOrderIndex'>;
export type CreateCourseDto = Omit<Course, 'id' | 'courseOrderNumber' | 'createdAt'>;
export type CreateExamDto = Omit<Exam, 'id' | 'examOrderNumber' | 'createdAt'>;
export type CreateQuestionDto = Omit<Question, 'id' | 'questionNumber'>;
export type CreateUserDto = Omit<User, 'id' | 'userNumber' | 'createdAt'>;