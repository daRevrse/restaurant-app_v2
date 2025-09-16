import apiClient from "./apiClient";

export const getCategories = async (includeDishs = false) => {
  const params = includeDishs ? { include_dishes: "true" } : {};
  const response = await apiClient.get("/categories", { params });
  return response.categories;
};

export const getDishes = async (filters = {}) => {
  const response = await apiClient.get("/dishes", { params: filters });
  return response.dishes;
};

export const getDishById = async (dishId) => {
  const response = await apiClient.get(`/dishes/${dishId}`);
  return response.dish;
};

export const createDish = async (dishData) => {
  const formData = new FormData();

  // Ajouter tous les champs au FormData
  Object.keys(dishData).forEach((key) => {
    if (dishData[key] !== null && dishData[key] !== undefined) {
      formData.append(key, dishData[key]);
    }
  });

  const response = await apiClient.post("/dishes", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.dish;
};

export const updateDish = async (dishId, dishData) => {
  const formData = new FormData();

  Object.keys(dishData).forEach((key) => {
    if (dishData[key] !== null && dishData[key] !== undefined) {
      formData.append(key, dishData[key]);
    }
  });

  const response = await apiClient.put(`/dishes/${dishId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.dish;
};

export const deleteDish = async (dishId) => {
  await apiClient.delete(`/dishes/${dishId}`);
};
