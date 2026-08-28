import { apiFetch } from "./apiFetch";

// Récupérer tous les étudiants
export const getStudents = () => apiFetch("/students");

// Créer un étudiant
export const createStudent = (student) =>
  apiFetch("/students", {
    method: "POST",
    body: JSON.stringify(student),
  });

// Mettre à jour un étudiant
export const updateStudent = (id, student) =>
  apiFetch(`/students/${id}`, {
    method: "PUT",
    body: JSON.stringify(student),
  });

// Désactiver/Supprimer un étudiant (RG-10)
export const disableStudent = (id) =>
  apiFetch(`/students/${id}`, {
    method: "DELETE",
  });