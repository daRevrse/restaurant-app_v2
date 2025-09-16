import { useState, useCallback } from "react";
import * as orderService from "../services/orderService";
import { useSocket } from "./useSocket";
import { notification } from "antd";

export const useOrders = () => {
  const [loading, setLoading] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const { on, off } = useSocket();

  // Passer une commande
  const placeOrder = useCallback(async (orderData) => {
    try {
      setLoading(true);
      const response = await orderService.createOrder(orderData);
      setCurrentOrder(response.order);

      notification.success({
        message: "Commande passée !",
        description: `Numéro: ${response.order.order_number}`,
        placement: "topRight",
      });

      return response.order;
    } catch (error) {
      console.error("Erreur commande:", error);
      notification.error({
        message: "Erreur",
        description:
          error.response?.data?.error || "Impossible de passer la commande",
        placement: "topRight",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Écouter les mises à jour de commande via WebSocket
  const subscribeToOrderUpdates = useCallback(
    (orderId) => {
      const handleStatusUpdate = (update) => {
        if (update.orderId === orderId) {
          setCurrentOrder((prev) => ({
            ...prev,
            status: update.status,
            [`${update.status}_at`]: update.timestamp,
          }));

          notification.info({
            message: "Mise à jour commande",
            description: update.message,
            placement: "topRight",
          });
        }
      };

      on("orderStatusUpdate", handleStatusUpdate);

      // Nettoyer l'écouteur
      return () => off("orderStatusUpdate");
    },
    [on, off]
  );

  return {
    loading,
    currentOrder,
    placeOrder,
    subscribeToOrderUpdates,
  };
};
