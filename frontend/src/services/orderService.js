import apiClient from "./apiClient";

export const createOrder = async (orderData) => {
  const response = await apiClient.post("/orders", orderData);
  return response;
};

export const getOrderById = async (orderId) => {
  const response = await apiClient.get(`/orders/${orderId}`);
  return response.order;
};

export const getOrdersByTable = async (tableId, status = null) => {
  const params = status ? { status } : {};
  const response = await apiClient.get(`/orders/table/${tableId}`, { params });
  return response.orders;
};

export const getOrdersByStatus = async (status) => {
  const response = await apiClient.get(`/orders/status/${status}`);
  return response.orders;
};

export const updateOrderStatus = async (orderId, status) => {
  const response = await apiClient.patch(`/orders/${orderId}/status`, {
    status,
  });
  return response.order;
};

export const getUserOrders = async (userId) => {
  const response = await apiClient.get(`/orders/user/${userId}`);
  return response.orders;
};

// Préparer les données de commande depuis le panier
export const prepareOrderData = (
  cartItems,
  tableSession,
  specialInstructions = ""
) => {
  // Si session de table (QR Code)
  if (tableSession) {
    return {
      table_id: tableSession.tableId,
      session_id: tableSession.sessionId,
      items: cartItems.map((item) => ({
        dish_id: item.dish_id,
        quantity: item.quantity,
        special_instructions: item.special_instructions || null,
      })),
      special_instructions: specialInstructions,
    };
  }

  // Sinon commande utilisateur normal (nécessite authentification)
  throw new Error("Session de table requise pour passer commande");
};
