import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { login as loginRequest } from "../api/auth";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // 1. Initialisation avec les clés 'examhub_*' (synchronisées avec apiFetch)
  const [token, setToken] = useState(() => {
    return localStorage.getItem("examhub_token");
  });

  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("examhub_user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  // 2. Synchronization automatique avec le LocalStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem("examhub_token", token);
    } else {
      localStorage.removeItem("examhub_token");
    }

    if (user) {
      localStorage.setItem("examhub_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("examhub_user");
    }
  }, [token, user]);

  // 3. Fonction de Connexion
  const login = async (email, password) => {
    const response = await loginRequest(email, password);

    // Extraction des données (gestion du wrapper { success: true, data: { ... } })
    const payload = response?.data || response;

    const nextToken = payload?.token || payload?.accessToken;
    const nextUser = payload?.user || payload?.account;

    if (!nextToken || !nextUser) {
      throw new Error("Invalid login response.");
    }

    setToken(nextToken);
    setUser(nextUser);

    return nextUser;
  };

  // 4. Fonction de Déconnexion
  const logout = () => {
    setToken(null);
    setUser(null);
  };

  // 5. Mémorisation de la valeur du contexte
  const value = useMemo(
    () => ({
      token,
      user,
      login,
      logout,
      isAuthenticated: Boolean(token && user),
    }),
    [token, user]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider");
  }
  return context;
};