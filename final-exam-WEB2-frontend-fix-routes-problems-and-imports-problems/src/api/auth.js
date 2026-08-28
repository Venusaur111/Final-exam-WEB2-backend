import { apiFetch } from "./apiFetch";

export const login = (email, password) => apiFetch("/auth/login", {
  method: "POST",
  body: JSON.stringify({ email, password }),
});
