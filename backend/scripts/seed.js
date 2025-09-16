// backend/scripts/seed.js - Version corrigée
const { sequelize, User, Category, Dish, Table } = require("../models");

async function seedDatabase() {
  try {
    console.log("🌱 Démarrage du seeding...");

    // Synchroniser la base de données
    await sequelize.sync({ force: false });
    console.log("✅ Base de données synchronisée");

    // Créer un utilisateur admin
    const [adminUser, created] = await User.findOrCreate({
      where: { username: "admin" },
      defaults: {
        username: "admin",
        email: "admin@restaurant.com",
        password: "admin123",
        role: "admin",
        isActive: true,
      },
    });

    if (created) {
      console.log("✅ Utilisateur admin créé");
    } else {
      console.log("ℹ️  Utilisateur admin existe déjà");
    }

    // Créer des utilisateurs d'exemple
    const users = [
      {
        username: "waiter1",
        email: "waiter1@restaurant.com",
        password: "waiter123",
        role: "waiter",
      },
      {
        username: "kitchen1",
        email: "kitchen1@restaurant.com",
        password: "kitchen123",
        role: "kitchen",
      },
      {
        username: "customer1",
        email: "customer1@restaurant.com",
        password: "customer123",
        role: "customer",
      },
    ];

    for (const userData of users) {
      await User.findOrCreate({
        where: { username: userData.username },
        defaults: userData,
      });
    }
    console.log("✅ Utilisateurs d'exemple créés");

    // Créer des catégories
    const categories = [
      {
        name: "Entrées",
        description: "Plats d'entrée délicieux pour bien commencer",
        icon: "🥗",
        sort_order: 1,
        isActive: true,
      },
      {
        name: "Plats principaux",
        description: "Nos spécialités savoureuses",
        icon: "🍽️",
        sort_order: 2,
        isActive: true,
      },
      {
        name: "Desserts",
        description: "Douceurs sucrées pour finir en beauté",
        icon: "🍰",
        sort_order: 3,
        isActive: true,
      },
      {
        name: "Boissons",
        description: "Boissons fraîches et chaudes",
        icon: "🥤",
        sort_order: 4,
        isActive: true,
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
      // Entrées
      {
        name: "Salade César",
        description: "Salade fraîche avec croûtons, parmesan et sauce César maison",
        price: 2500,
        category_id: createdCategories[0].id,
        preparation_time: 10,
        is_vegetarian: true,
        is_available: true,
        ingredients: ["Laitue", "Croûtons", "Parmesan", "Sauce César"],
        calories: 320,
      },
      {
        name: "Soupe du jour",
        description: "Soupe préparée avec des légumes de saison",
        price: 1800,
        category_id: createdCategories[0].id,
        preparation_time: 5,
        is_vegetarian: true,
        is_vegan: true,
        is_available: true,
      },
      {
        name: "Bruschetta",
        description: "Pain grillé aux tomates fraîches et basilic",
        price: 2200,
        category_id: createdCategories[0].id,
        preparation_time: 8,
        is_vegetarian: true,
        is_available: true,
      },

      // Plats principaux
      {
        name: "Poulet grillé",
        description: "Filet de poulet grillé avec légumes de saison et riz",
        price: 4500,
        category_id: createdCategories[1].id,
        preparation_time: 25,
        is_available: true,
        ingredients: ["Poulet", "Légumes", "Riz", "Herbes"],
        calories: 580,
      },
      {
        name: "Poisson du jour",
        description: "Poisson frais grillé avec accompagnement",
        price: 5200,
        category_id: createdCategories[1].id,
        preparation_time: 20,
        is_available: true,
        calories: 420,
      },
      {
        name: "Pasta végétarienne",
        description: "Pâtes aux légumes frais et sauce tomate maison",
        price: 3800,
        category_id: createdCategories[1].id,
        preparation_time: 15,
        is_vegetarian: true,
        is_available: true,
      },
      {
        name: "Burger maison",
        description: "Burger de bœuf avec frites maison",
        price: 4200,
        category_id: createdCategories[1].id,
        preparation_time: 18,
        is_available: true,
        calories: 720,
      },

      // Desserts
      {
        name: "Tiramisu",
        description: "Dessert italien traditionnel au café",
        price: 2000,
        category_id: createdCategories[2].id,
        preparation_time: 5,
        is_vegetarian: true,
        is_available: true,
        calories: 290,
      },
      {
        name: "Tarte aux fruits",
        description: "Tarte saisonnière aux fruits frais",
        price: 1800,
        category_id: createdCategories[2].id,
        preparation_time: 5,
        is_vegetarian: true,
        is_available: true,
      },
      {
        name: "Glace artisanale",
        description: "Glace maison, parfums variés",
        price: 1500,
        category_id: createdCategories[2].id,
        preparation_time: 2,
        is_vegetarian: true,
        is_available: true,
      },

      // Boissons
      {
        name: "Coca-Cola",
        description: "Boisson gazeuse fraîche",
        price: 500,
        category_id: createdCategories[3].id,
        preparation_time: 1,
        is_available: true,
        calories: 150,
      },
      {
        name: "Eau minérale",
        description: "Eau minérale plate ou gazeuse",
        price: 300,
        category_id: createdCategories[3].id,
        preparation_time: 1,
        is_available: true,
        calories: 0,
      },
      {
        name: "Jus de fruits frais",
        description: "Jus pressé à la commande",
        price: 800,
        category_id: createdCategories[3].id,
        preparation_time: 3,
        is_available: true,
        calories: 120,
      },
      {
        name: "Café expresso",
        description: "Café italien authentique",
        price: 400,
        category_id: createdCategories[3].id,
        preparation_time: 2,
        is_available: true,
        calories: 5,
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
    for (let i = 1; i <= 15; i++) {
      await Table.findOrCreate({
        where: { number: i },
        defaults: {
          number: i,
          capacity: i <= 8 ? 4 : i <= 12 ? 6 : 8,
          status: "free",
          position: {
            x: Math.floor(Math.random() * 10) + 1,
            y: Math.floor(Math.random() * 10) + 1,
            zone: i <= 5 ? "terrasse" : i <= 10 ? "salle_principale" : "salon_privé",
          },
        },
      });
    }
    console.log("✅ Tables créées");

    console.log("🎉 Seeding terminé avec succès !");
    console.log("");
    console.log("📋 Comptes créés :");
    console.log("   Admin : username=admin, password=admin123");
    console.log("   Serveur : username=waiter1, password=waiter123");
    console.log("   Cuisine : username=kitchen1, password=kitchen123");
    console.log("   Client : username=customer1, password=customer123");
    console.log("");
    console.log("🏪 Données créées :");
    console.log(`   ${categories.length} catégories`);
    console.log(`   ${dishes.length} plats`);
    console.log("   15 tables");
    console.log("");

  } catch (error) {
    console.error("❌ Erreur lors du seeding:", error);
    throw error;
  }
}

// Exporter pour utilisation
module.exports = { seedDatabase };

// Exécuter si appelé directement
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log("✅ Seeding terminé, fermeture de la connexion...");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Erreur:", error);
      process.exit(1);
    });
}