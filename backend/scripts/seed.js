const { sequelize, User, Category, Dish, Table } = require("../models");
const bcrypt = require("bcryptjs");

async function seedDatabase() {
  try {
    console.log("🌱 Démarrage du seeding...");

    // Créer un utilisateur admin
    const adminUser = await User.findOrCreate({
      where: { username: "admin" },
      defaults: {
        username: "admin",
        email: "admin@restaurant.com",
        password: "admin123",
        role: "admin",
      },
    });

    if (adminUser[1]) {
      console.log("✅ Utilisateur admin créé");
    }

    // Créer des catégories
    const categories = [
      {
        name: "Entrées",
        description: "Plats d'entrée délicieux",
        icon: "🥗",
        sort_order: 1,
      },
      {
        name: "Plats principaux",
        description: "Nos spécialités",
        icon: "🍽️",
        sort_order: 2,
      },
      {
        name: "Desserts",
        description: "Douceurs sucrées",
        icon: "🍰",
        sort_order: 3,
      },
      {
        name: "Boissons",
        description: "Boissons fraîches",
        icon: "🥤",
        sort_order: 4,
      },
    ];

    const createdCategories = [];
    for (const catData of categories) {
      const [category] = await Category.findOrCreate({
        where: { name: catData.name },
        defaults: catData,
      });
      createdCategories.push(category);
    }
    console.log("✅ Catégories créées");

    // Créer des plats d'exemple
    const dishes = [
      {
        name: "Salade César",
        description: "Salade fraîche avec croûtons et parmesan",
        price: 2500,
        category_id: createdCategories[0].id,
        preparation_time: 10,
        is_vegetarian: true,
      },
      {
        name: "Poulet grillé",
        description: "Filet de poulet grillé avec légumes",
        price: 4500,
        category_id: createdCategories[1].id,
        preparation_time: 25,
      },
      {
        name: "Tiramisu",
        description: "Dessert italien traditionnel",
        price: 2000,
        category_id: createdCategories[2].id,
        preparation_time: 5,
        is_vegetarian: true,
      },
      {
        name: "Coca-Cola",
        description: "Boisson gazeuse fraîche",
        price: 500,
        category_id: createdCategories[3].id,
        preparation_time: 1,
      },
    ];

    for (const dishData of dishes) {
      await Dish.findOrCreate({
        where: { name: dishData.name },
        defaults: dishData,
      });
    }
    console.log("✅ Plats d'exemple créés");

    // Créer des tables
    for (let i = 1; i <= 10; i++) {
      await Table.findOrCreate({
        where: { number: i },
        defaults: {
          number: i,
          capacity: i <= 6 ? 4 : 6,
          status: "free",
        },
      });
    }
    console.log("✅ Tables créées");

    console.log("🎉 Seeding terminé avec succès !");
  } catch (error) {
    console.error("❌ Erreur lors du seeding:", error);
    throw error;
  }
}

// Exporter pour utilisation
module.exports = { seedDatabase };
