import { useCallback, useRef } from "react";
import { io } from "socket.io-client";
import { message } from "antd";

export const useSocket = () => {
  const socketRef = useRef(null);

  // Connecter le socket
  const connect = useCallback((token) => {
    if (socketRef.current?.connected) {
      return; // Déjà connecté
    }

    try {
      socketRef.current = io(
        process.env.REACT_APP_SOCKET_URL || "http://localhost:5000",
        {
          auth: {
            token: token,
          },
          transports: ["websocket", "polling"],
        }
      );

      socketRef.current.on("connect", () => {
        console.log("✅ Socket connecté");
      });

      socketRef.current.on("disconnect", () => {
        console.log("🔌 Socket déconnecté");
      });

      // Écouter les notifications
      socketRef.current.on("notification", (data) => {
        message.info(data.message);
      });

      // Écouter les mises à jour de commandes
      socketRef.current.on("order_update", (data) => {
        message.success(`Commande ${data.orderNumber} : ${data.status}`);
      });

      socketRef.current.on("connect_error", (error) => {
        console.warn("Erreur connexion socket:", error);
      });
    } catch (error) {
      console.error("Erreur initialisation socket:", error);
    }
  }, []);

  // Déconnecter le socket
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  }, []);

  // Émettre un événement
  const emit = useCallback((eventName, data) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(eventName, data);
    }
  }, []);

  // Écouter un événement
  const on = useCallback((eventName, callback) => {
    if (socketRef.current) {
      socketRef.current.on(eventName, callback);

      // Retourner une fonction pour supprimer l'écouteur
      return () => {
        socketRef.current?.off(eventName, callback);
      };
    }
  }, []);

  return {
    connect,
    disconnect,
    emit,
    on,
    socket: socketRef.current,
  };
};
