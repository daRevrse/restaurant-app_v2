import apiClient from "./apiClient";

export const getDashboardStats = async () => {
  const response = await apiClient.get("/orders/admin/dashboard");
  return response.stats;
};

export const getRealtimeStats = async () => {
  const response = await apiClient.get("/stats/realtime");
  return response;
};
