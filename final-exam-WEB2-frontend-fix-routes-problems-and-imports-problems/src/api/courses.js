import { apiFetch } from "./apiFetch";
export const getCourses = () => apiFetch("/courses");
export const createCourse = (course) => apiFetch("/courses", { method: "POST", body: JSON.stringify(course) });
export const updateCourse = (id, course) => apiFetch(`/courses/${id}`, { method: "PUT", body: JSON.stringify(course) });
export const deleteCourse = (id) => apiFetch(`/courses/${id}`, { method: "DELETE" });
