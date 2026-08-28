import { apiFetch } from "./apiFetch";
export const getQuestions = (examId) => apiFetch(`/exams/${examId}/questions`);
export const createQuestion = (examId, question) => apiFetch(`/exams/${examId}/questions`, { method: "POST", body: JSON.stringify(question) });
export const updateQuestion = (id, question) => apiFetch(`/questions/${id}`, { method: "PUT", body: JSON.stringify(question) });
export const deleteQuestion = (id) => apiFetch(`/questions/${id}`, { method: "DELETE" });
