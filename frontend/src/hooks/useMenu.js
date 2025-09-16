import { useState, useEffect } from "react";
import apiClient from "../services/apiClient";

export const useMenu = () => {
  const [categories, setCategories] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Récupérer les catégories
  const fetchCategories = async () => {
    try {
      const response = await apiClient.get("/categories?include_dishes=true");
      setCategories(response.categories || []);
    } catch (error) {
      console.error("Erreur récupération catégories:", error);
    }
  };

  // Récupérer les plats
  const fetchDishes = async (categoryId = null) => {
    try {
      const params = new URLSearchParams();
      if (categoryId) params.append("category_id", categoryId);
      if (searchTerm) params.append("search", searchTerm);

      const response = await apiClient.get(`/dishes?${params.toString()}`);
      setDishes(response.dishes || []);
    } catch (error) {
      console.error("Erreur récupération plats:", error);
    }
  };

  // Filtrer les plats selon les critères
  const filteredDishes = dishes.filter((dish) => {
    const matchesSearch =
      !searchTerm ||
      dish.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dish.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      !selectedCategory || dish.category_id === selectedCategory;

    return matchesSearch && matchesCategory && dish.is_available;
  });

  // Charger les données initiales
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchCategories(), fetchDishes()]);
      setLoading(false);
    };

    loadData();
  }, []);

  // Recharger les plats quand les filtres changent
  useEffect(() => {
    fetchDishes(selectedCategory);
  }, [selectedCategory, searchTerm]);

  return {
    categories,
    dishes: filteredDishes,
    loading,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    refetch: () => {
      fetchCategories();
      fetchDishes(selectedCategory);
    },
  };
};
