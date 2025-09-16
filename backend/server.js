// backend/server.js - Version sans Redis
require("dotenv").config();
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const path = require("path");
const fs = require("fs");

// Import des modules personnalisés
const { sequelize } = require("./models");
const SocketManager = require("./config/socket");
const { generalLimiter } = require("./middleware/rateLimiter");

// Import des routes
const authRoutes = require("./routes/auth");
const orderRoutes = require("./routes/orders");
const tableRoutes = require("./routes/tables");
const dishRoutes = require("./routes/dishes");
const categoryRoutes = require("./routes/categories");
const userRoutes = require("./routes/users");

const app = express();
const server = http.createServer(app);

// Configuration CORS pour Socket.IO
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Initialisation du SocketManager
const socketManager = new SocketManager(io);
app.set("socketManager", socketManager);

// ===== MIDDLEWARE GLOBAUX =====

// Sécurité
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

// Compression
app.use(compression());

// Rate limiting (en mémoire)
app.use(generalLimiter);

// Parsing des requêtes
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Servir les fichiers statiques
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Créer les dossiers d'upload s'ils n'existent pas
const uploadDirs = ["uploads/dishes", "uploads/users", "uploads/qrcodes"];
uploadDirs.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 Dossier créé: ${dir}`);
  }
});

// ===== ROUTES =====

// Route de santé
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || "1.0.0",
    environment: process.env.NODE_ENV || "development",
    services: {
      database: "connected",
      rateLimiting: "memory",
    },
  });
});

// Routes API
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/tables", tableRoutes);
app.use("/api/dishes", dishRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/users", userRoutes);

// Route pour les stats temps réel (WebSocket info)
app.get("/api/stats/realtime", (req, res) => {
  const stats = socketManager.getConnectedUsersCount();
  res.json(stats);
});

// Middleware de gestion d'erreur global
app.use((err, req, res, next) => {
  console.error("Erreur serveur:", err);

  // Erreur de validation Sequelize
  if (err.name === "SequelizeValidationError") {
    return res.status(400).json({
      error: "Données invalides",
      code: "VALIDATION_ERROR",
      details: err.errors.map((e) => ({
        field: e.path,
        message: e.message,
      })),
    });
  }

  // Erreur de contrainte unique
  if (err.name === "SequelizeUniqueConstraintError") {
    return res.status(409).json({
      error: "Données déjà existantes",
      code: "UNIQUE_CONSTRAINT_ERROR",
      field: err.errors[0]?.path,
    });
  }

  // Erreur Multer (upload de fichiers)
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      error: "Fichier trop volumineux",
      code: "FILE_TOO_LARGE",
    });
  }

  // Erreur par défaut
  res.status(500).json({
    error: "Erreur interne du serveur",
    code: "INTERNAL_SERVER_ERROR",
    ...(process.env.NODE_ENV === "development" && { details: err.message }),
  });
});

// Route 404
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Route non trouvée",
    code: "ROUTE_NOT_FOUND",
    path: req.originalUrl,
  });
});

// ===== DÉMARRAGE DU SERVEUR =====
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Connexion à la base de données
    await sequelize.authenticate();
    console.log("✅ Connexion à la base de données établie");

    // Synchronisation des modèles avec gestion d'erreur améliorée
    if (process.env.NODE_ENV === "development") {
      try {
        // Essayer d'abord une synchronisation douce
        await sequelize.sync({ alter: false });
        console.log("✅ Modèles synchronisés avec la base de données");
      } catch (syncError) {
        console.warn(
          "⚠️  Erreur de synchronisation détectée:",
          syncError.message
        );

        // Si ça échoue, proposer une réinitialisation
        if (syncError.name === "SequelizeDatabaseError") {
          console.log("");
          console.log("💡 SOLUTION RECOMMANDÉE:");
          console.log(
            "   La structure de la base de données semble corrompue."
          );
          console.log("   Exécutez cette commande pour réinitialiser:");
          console.log("   npm run setup");
          console.log("");
          process.exit(1);
        }

        throw syncError;
      }
    }

    // Démarrage du serveur
    server.listen(PORT, () => {
      console.log("");
      console.log("🚀========================================🚀");
      console.log(`   🏪 Restaurant Backend Server Started`);
      console.log(`   📡 Port: ${PORT}`);
      console.log(
        `   🌍 Environment: ${process.env.NODE_ENV || "development"}`
      );
      console.log(
        `   📱 Frontend: ${process.env.FRONTEND_URL || "http://localhost:3000"}`
      );
      console.log(`   🔗 Health Check: http://localhost:${PORT}/health`);
      console.log(`   📚 API Base: http://localhost:${PORT}/api`);
      console.log(`   💾 Rate Limiting: En mémoire (sans Redis)`);
      console.log("🚀========================================🚀");
      console.log("");
      console.log("💡 Commandes utiles:");
      console.log("   npm run setup     - Réinitialiser et seeder la DB");
      console.log("   npm run seed      - Ajouter des données de test");
      console.log("   npm run reset-db  - Réinitialiser la structure DB");
      console.log("");
    });
  } catch (error) {
    console.error("❌ Erreur lors du démarrage du serveur:", error);

    if (error.name === "SequelizeConnectionError") {
      console.log("");
      console.log("💡 PROBLÈME DE CONNEXION À LA BASE DE DONNÉES:");
      console.log("   1. Vérifiez que MySQL est démarré");
      console.log("   2. Vérifiez les identifiants dans le fichier .env");
      console.log("   3. Vérifiez que la base de données existe:");
      console.log(
        `      CREATE DATABASE ${process.env.DB_NAME || "restaurant_dev"};`
      );
      console.log("");
    }

    process.exit(1);
  }
}

// Gestion propre de l'arrêt du serveur
process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

async function gracefulShutdown() {
  console.log("🛑 Arrêt du serveur en cours...");

  server.close(async () => {
    console.log("📴 Serveur HTTP fermé");

    try {
      await sequelize.close();
      console.log("✅ Connexion base de données fermée");
      console.log("✅ Arrêt propre du serveur");
    } catch (error) {
      console.error("❌ Erreur lors de la fermeture:", error);
    }

    process.exit(0);
  });
}

// Démarrer le serveur
startServer();
