import { useState, useEffect, useCallback } from "react";
import * as authService from "../services/authService";
import { useSocket } from "./useSocket";

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { connect, disconnect } = useSocket();

  // Initialiser l'authentification au chargement
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (token) {
          const userData = await authService.getCurrentUser();
          setUser(userData);
          setIsAuthenticated(true);
          // Connecter le WebSocket avec le token
          connect(token);
        }
      } catch (error) {
        // Token invalide ou expiré
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        console.error("Erreur initialisation auth:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [connect]);

  // Fonction de connexion
  const login = useCallback(
    async (credentials) => {
      try {
        setLoading(true);
        const response = await authService.login(credentials);

        // Sauvegarder les tokens
        localStorage.setItem("accessToken", response.accessToken);
        localStorage.setItem("refreshToken", response.refreshToken);

        // Mettre à jour l'état
        setUser(response.user);
        setIsAuthenticated(true);

        // Connecter WebSocket
        connect(response.accessToken);

        return response;
      } catch (error) {
        console.error("Erreur login:", error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [connect]
  );

  // Fonction de déconnexion
  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Erreur logout:", error);
    } finally {
      // Nettoyer l'état local dans tous les cas
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("tableSession");
      setUser(null);
      setIsAuthenticated(false);
      disconnect();
    }
  }, [disconnect]);

  // Fonction d'inscription
  const register = useCallback(
    async (userData) => {
      try {
        setLoading(true);
        const response = await authService.register(userData);

        // Auto-login après inscription
        localStorage.setItem("accessToken", response.accessToken);
        localStorage.setItem("refreshToken", response.refreshToken);
        setUser(response.user);
        setIsAuthenticated(true);
        connect(response.accessToken);

        return response;
      } catch (error) {
        console.error("Erreur inscription:", error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [connect]
  );

  return {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    register,
  };
};
