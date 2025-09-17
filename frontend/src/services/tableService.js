// frontend/src/services/tableService.js - Version corrigée avec nouvelles routes
import apiClient from "./apiClient";

export const getTables = async (status = null) => {
  const params = status ? { status } : {};
  const response = await apiClient.get("/tables", { params });
  return response.tables;
};

export const getTableById = async (tableId) => {
  const response = await apiClient.get(`/tables/${tableId}`);
  return response.table;
};

export const getTableByNumber = async (tableNumber) => {
  const response = await apiClient.get(`/tables/${tableNumber}`);
  return response.table;
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

// MÉTHODE CORRIGÉE : Validation QR Code avec API backend
export const validateQRCode = async (qrData) => {
  try {
    const response = await apiClient.post("/tables/validate-qr", {
      qrData: qrData,
    });

    return response.sessionData;
  } catch (error) {
    // Gestion des erreurs spécifiques
    if (error.response?.status === 404) {
      throw new Error("Table non trouvée");
    } else if (error.response?.status === 409) {
      throw new Error("Table non disponible");
    } else if (error.response?.status === 400) {
      throw new Error("QR Code invalide");
    } else {
      throw new Error("Erreur lors de la validation du QR Code");
    }
  }
};

// MÉTHODE SIMPLIFIÉE : Scanner QR Code
export const scanQRCode = async (qrData) => {
  try {
    // Si c'est déjà un objet, l'utiliser directement
    const qrInfo = typeof qrData === "string" ? JSON.parse(qrData) : qrData;

    // Récupérer la table via la nouvelle route
    const table = await getTableByNumber(qrInfo.tableNumber);

    // Vérifier disponibilité
    if (table.status !== "free") {
      throw new Error("Table non disponible");
    }

    // Créer les données de session
    const sessionData = {
      tableId: table.id,
      tableNumber: table.number,
      sessionId: qrInfo.sessionId,
      timestamp: Date.now(),
    };

    // Sauvegarder les infos de session localement
    localStorage.setItem("tableSession", JSON.stringify(sessionData));
    return sessionData;
  } catch (error) {
    throw new Error(
      error.message || "QR Code invalide ou table non disponible"
    );
  }
};

// MÉTHODE : Récupérer session active depuis localStorage
export const getActiveTableSession = () => {
  try {
    const sessionData = localStorage.getItem("tableSession");
    if (!sessionData) return null;

    const session = JSON.parse(sessionData);

    // Vérifier que la session n'est pas trop ancienne (8 heures max)
    const maxAge = 8 * 60 * 60 * 1000; // 8 heures en ms
    if (Date.now() - session.timestamp > maxAge) {
      localStorage.removeItem("tableSession");
      return null;
    }

    return session;
  } catch (error) {
    console.error("Erreur récupération session:", error);
    localStorage.removeItem("tableSession");
    return null;
  }
};

// MÉTHODE : Nettoyer session
export const clearTableSession = () => {
  localStorage.removeItem("tableSession");
};

// MÉTHODE : Valider numéro de table manuellement
export const validateTableNumber = async (tableNumber) => {
  try {
    // Récupérer directement la table
    const table = await getTableByNumber(tableNumber);

    // Vérifier disponibilité
    if (table.status !== "free") {
      throw new Error(`Table ${tableNumber} n'est pas disponible`);
    }

    // Créer données de session
    const sessionData = {
      tableId: table.id,
      tableNumber: table.number,
      sessionId: `manual_${Date.now()}`,
      timestamp: Date.now(),
    };

    return sessionData;
  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error("Table non trouvée");
    }
    throw error;
  }
};

// MÉTHODE : Trouver tables disponibles
export const findAvailableTables = async (capacity = null) => {
  const params = {
    status: "free",
    ...(capacity && { capacity }),
  };
  const response = await apiClient.get("/tables", { params });
  return response.tables;
};
