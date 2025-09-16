import { useState, useEffect, useCallback } from "react";
import * as menuService from "../services/menuService";

export const useMenu = () => {
  const [dishes, setDishes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Charger les catégories
  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      const categoriesData = await menuService.getCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error("Erreur chargement catégories:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Charger les plats
  const loadDishes = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      const dishesData = await menuService.getDishes(filters);
      setDishes(dishesData);
    } catch (error) {
      console.error("Erreur chargement plats:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Filtrer les plats affichés
  const filteredDishes = dishes.filter((dish) => {
    const matchesCategory =
      !selectedCategory || dish.category_id === selectedCategory;
    const matchesSearch =
      !searchTerm ||
      dish.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dish.description?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesCategory && matchesSearch && dish.is_available;
  });

  // Charger les données initiales
  useEffect(() => {
    loadCategories();
    loadDishes();
  }, [loadCategories, loadDishes]);

  return {
    dishes,
    categories,
    filteredDishes,
    loading,
    selectedCategory,
    searchTerm,
    setSelectedCategory,
    setSearchTerm,
    refreshMenu: loadDishes,
    refreshCategories: loadCategories,
  };
};
