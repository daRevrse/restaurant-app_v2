import apiClient from "./apiClient";

export const getTables = async (status = null) => {
  const params = status ? { status } : {};
  const response = await apiClient.get("/tables", { params });
  return response.tables;
};

export const createTable = async (tableData) => {
  const response = await apiClient.post("/tables", tableData);
  return response.table;
};

export const updateTableStatus = async (tableId, status, notes = null) => {
  const response = await apiClient.patch(`/tables/${tableId}/status`, {
    status,
    notes,
  });
  return response.table;
};

export const startTableSession = async (tableId, customerData) => {
  const response = await apiClient.post(
    `/tables/${tableId}/session`,
    customerData
  );
  return response.session;
};

export const endTableSession = async (sessionId, paymentData = null) => {
  const response = await apiClient.patch(
    `/tables/session/${sessionId}/end`,
    paymentData
  );
  return response.session;
};

export const scanQRCode = async (qrData) => {
  // Décoder les données QR et démarrer une session
  try {
    const qrInfo = JSON.parse(qrData);
    const table = await apiClient.get(`/tables/${qrInfo.tableNumber}`);

    // Vérifier si la table est libre
    if (table.status !== "free") {
      throw new Error("Table non disponible");
    }

    // Sauvegarder les infos de session localement
    const sessionData = {
      tableId: table.id,
      tableNumber: table.number,
      sessionId: qrInfo.sessionId,
      timestamp: Date.now(),
    };

    localStorage.setItem("tableSession", JSON.stringify(sessionData));
    return sessionData;
  } catch (error) {
    throw new Error("QR Code invalide ou table non disponible");
  }
};
