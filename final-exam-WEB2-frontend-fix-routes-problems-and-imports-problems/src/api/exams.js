import { apiFetch } from "./apiFetch";
export const getExams = () => apiFetch("/exams");
export const getExam = (id) => apiFetch(`/exams/${id}`);
export const createExam = (exam) => apiFetch("/exams", { method: "POST", body: JSON.stringify(exam) });
export const updateExam = (id, exam) => apiFetch(`/exams/${id}`, { method: "PUT", body: JSON.stringify(exam) });
export const deleteExam = (id) => apiFetch(`/exams/${id}`, { method: "DELETE" });
export const getExamResults = (id) => apiFetch(`/exams/${id}/results`);
