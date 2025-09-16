import { useState, useCallback } from "react";
import { message } from "antd";

export const useCart = () => {
  const [items, setItems] = useState([]);

  // Calculer les totaux
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Ajouter un article au panier
  const addToCart = useCallback((newItem) => {
    setItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex(
        (item) => item.id === newItem.id
      );

      if (existingItemIndex > -1) {
        // Article existe déjà, augmenter la quantité
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += newItem.quantity || 1;
        message.success(`${newItem.name} ajouté au panier`);
        return updatedItems;
      } else {
        // Nouvel article
        message.success(`${newItem.name} ajouté au panier`);
        return [...prevItems, { ...newItem, quantity: newItem.quantity || 1 }];
      }
    });
  }, []);

  // Supprimer un article du panier
  const removeFromCart = useCallback((itemId) => {
    setItems((prevItems) => {
      const updatedItems = prevItems.filter((item) => item.id !== itemId);
      message.success("Article retiré du panier");
      return updatedItems;
    });
  }, []);

  // Mettre à jour la quantité d'un article
  const updateCartItem = useCallback((itemId, updates) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, ...updates } : item
      )
    );
  }, []);

  // Vider le panier
  const clearCart = useCallback(() => {
    setItems([]);
    message.success("Panier vidé");
  }, []);

  return {
    items,
    totalItems,
    totalAmount,
    addToCart,
    removeFromCart,
    updateCartItem,
    clearCart,
  };
};
