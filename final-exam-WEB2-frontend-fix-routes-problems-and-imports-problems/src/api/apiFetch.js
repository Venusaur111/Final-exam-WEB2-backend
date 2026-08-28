const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:3000/api").replace(/\/$/, "");

export async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem("examhub_token");
  const headers = new Headers(options.headers || {});
  if (options.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let response;

  try {
    response = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
  } catch {
    throw new Error("Impossible de contacter le serveur. Vérifiez que le backend est démarré.");
  }

  let data = null;
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    try { data = await response.json(); } catch { data = null; }
  }

  if (!response.ok) {
    const message = data?.message || `Erreur ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }
  return data;
}

export { API_URL };
