import { useState, useEffect, useCallback } from "react";
import { notification } from "antd";

export const useCart = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Charger le panier depuis localStorage
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("cart");
      if (savedCart) {
        setItems(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error("Erreur chargement panier:", error);
    }
  }, []);

  // Sauvegarder le panier dans localStorage
  const saveCart = useCallback((cartItems) => {
    try {
      localStorage.setItem("cart", JSON.stringify(cartItems));
      setItems(cartItems);
    } catch (error) {
      console.error("Erreur sauvegarde panier:", error);
    }
  }, []);

  // Ajouter un item au panier
  const addItem = useCallback(
    (dish, quantity = 1, specialInstructions = "") => {
      setItems((currentItems) => {
        const existingItemIndex = currentItems.findIndex(
          (item) =>
            item.dish_id === dish.id &&
            item.special_instructions === specialInstructions
        );

        let newItems;
        if (existingItemIndex >= 0) {
          // Item existe déjà, augmenter la quantité
          newItems = currentItems.map((item, index) =>
            index === existingItemIndex
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          // Nouvel item
          const newItem = {
            id: `${dish.id}-${Date.now()}`, // ID unique pour le panier
            dish_id: dish.id,
            name: dish.name,
            price: parseFloat(dish.price),
            image_url: dish.image_url,
            quantity,
            special_instructions: specialInstructions,
          };
          newItems = [...currentItems, newItem];
        }

        saveCart(newItems);

        notification.success({
          message: "Ajouté au panier",
          description: `${dish.name} (x${quantity})`,
          placement: "topRight",
          duration: 2,
        });

        return newItems;
      });
    },
    [saveCart]
  );

  // Supprimer un item du panier
  const removeItem = useCallback(
    (itemId) => {
      setItems((currentItems) => {
        const newItems = currentItems.filter((item) => item.id !== itemId);
        saveCart(newItems);
        return newItems;
      });
    },
    [saveCart]
  );

  // Mettre à jour la quantité d'un item
  const updateQuantity = useCallback(
    (itemId, newQuantity) => {
      if (newQuantity <= 0) {
        removeItem(itemId);
        return;
      }

      setItems((currentItems) => {
        const newItems = currentItems.map((item) =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        );
        saveCart(newItems);
        return newItems;
      });
    },
    [removeItem, saveCart]
  );

  // Vider le panier
  const clearCart = useCallback(() => {
    setItems([]);
    localStorage.removeItem("cart");
  }, []);

  // Calculer le total
  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Calculer le nombre total d'items
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    items,
    loading,
    total,
    itemCount,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
  };
};
