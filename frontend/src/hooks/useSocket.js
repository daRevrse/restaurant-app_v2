import { useEffect, useRef, useCallback } from "react";
import io from "socket.io-client";

export const useSocket = () => {
  const socket = useRef(null);
  const listeners = useRef(new Map());

  // Connecter au WebSocket
  const connect = useCallback((token) => {
    if (socket.current?.connected) return;

    const serverURL =
      process.env.REACT_APP_SOCKET_URL || "http://localhost:5000";

    socket.current = io(serverURL, {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    socket.current.on("connect", () => {
      console.log("🔌 WebSocket connecté:", socket.current.id);

      // Authentifier le socket
      if (token) {
        socket.current.emit("authenticate", token);
      }
    });

    socket.current.on("authenticated", (response) => {
      if (response.success) {
        console.log("✅ Socket authentifié:", response.user);
      } else {
        console.error("❌ Erreur auth socket:", response.error);
      }
    });

    socket.current.on("disconnect", (reason) => {
      console.log("📴 Socket déconnecté:", reason);
    });

    socket.current.on("connect_error", (error) => {
      console.error("❌ Erreur connexion socket:", error);
    });

    // Restaurer les listeners
    listeners.current.forEach((callback, event) => {
      socket.current.on(event, callback);
    });
  }, []);

  // Déconnecter le WebSocket
  const disconnect = useCallback(() => {
    if (socket.current) {
      socket.current.disconnect();
      socket.current = null;
    }
  }, []);

  // Écouter un événement
  const on = useCallback((event, callback) => {
    listeners.current.set(event, callback);

    if (socket.current) {
      socket.current.on(event, callback);
    }
  }, []);

  // Arrêter d'écouter un événement
  const off = useCallback((event) => {
    listeners.current.delete(event);

    if (socket.current) {
      socket.current.off(event);
    }
  }, []);

  // Émettre un événement
  const emit = useCallback((event, data) => {
    if (socket.current?.connected) {
      socket.current.emit(event, data);
    } else {
      console.warn("Socket non connecté, impossible d'émettre:", event);
    }
  }, []);

  // Rejoindre une table
  const joinTable = useCallback(
    (tableId) => {
      emit("joinTable", tableId);
    },
    [emit]
  );

  return {
    connect,
    disconnect,
    on,
    off,
    emit,
    joinTable,
    isConnected: socket.current?.connected || false,
  };
};
