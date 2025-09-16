import { useContext } from "react";
import apiClient from "../services/apiClient";

export const useApi = () => {
  // Utiliser directement apiClient depuis vos services
  return { api: apiClient };
};
