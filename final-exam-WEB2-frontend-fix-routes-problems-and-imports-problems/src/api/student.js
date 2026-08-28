import { apiFetch } from "./apiFetch";
export const getMyExams = () => apiFetch("/my/exams");
export const getMyExam = (id) => apiFetch(`/my/exams/${id}`);
export const submitExam = (id, answers) => apiFetch(`/my/exams/${id}/submit`, { method: "POST", body: JSON.stringify({ answers }) });
export const getMyResults = () => apiFetch("/my/results");
