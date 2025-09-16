// backend/scripts/reset-db.js
const { sequelize } = require("../models");

async function resetDatabase() {
  try {
    console.log("🔄 Réinitialisation de la base de données...");

    // Supprimer toutes les tables
    await sequelize.drop();
    console.log("✅ Tables supprimées");

    // Recréer toutes les tables avec la structure actuelle
    await sequelize.sync({ force: true });
    console.log("✅ Tables recréées avec la nouvelle structure");

    console.log("🎉 Base de données réinitialisée avec succès !");
  } catch (error) {
    console.error("❌ Erreur lors de la réinitialisation:", error);
    throw error;
  }
}

// Exécuter si appelé directement
if (require.main === module) {
  resetDatabase()
    .then(() => {
      console.log("✅ Réinitialisation terminée");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Erreur:", error);
      process.exit(1);
    });
}

module.exports = { resetDatabase };
