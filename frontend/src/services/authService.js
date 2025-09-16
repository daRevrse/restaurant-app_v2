import apiClient from "./apiClient";

export const login = async (credentials) => {
  const response = await apiClient.post("/auth/login", credentials);
  return response;
};

export const register = async (userData) => {
  const response = await apiClient.post("/auth/register", userData);
  return response;
};

export const logout = async () => {
  const refreshToken = localStorage.getItem("refreshToken");
  if (refreshToken) {
    await apiClient.post("/auth/logout", { refreshToken });
  }
};

export const refreshToken = async () => {
  const refreshToken = localStorage.getItem("refreshToken");
  const response = await apiClient.post("/auth/refresh", { refreshToken });
  return response;
};

export const getCurrentUser = async () => {
  const response = await apiClient.get("/users/profile");
  return response.user;
};

export const updateProfile = async (profileData) => {
  const response = await apiClient.put("/users/profile", profileData);
  return response.user;
};
