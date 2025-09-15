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
const redis = require("./config/redis");
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

// Rate limiting
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

    // Synchronisation des modèles (en développement uniquement)
    if (process.env.NODE_ENV === "development") {
      await sequelize.sync({ alter: true });
      console.log("✅ Modèles synchronisés avec la base de données");
    }

    // Connexion à Redis
    await redis.connect();
    console.log("✅ Connexion à Redis établie");

    // Démarrage du serveur
    server.listen(PORT, () => {
      console.log(`🚀 Serveur démarré sur le port ${PORT}`);
      console.log(
        `📱 Frontend autorisé: ${
          process.env.FRONTEND_URL || "http://localhost:3000"
        }`
      );
      console.log(`🌍 Environnement: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    console.error("❌ Erreur lors du démarrage du serveur:", error);
    process.exit(1);
  }
}

// Gestion propre de l'arrêt du serveur
process.on("SIGTERM", async () => {
  console.log("🛑 Signal SIGTERM reçu, arrêt en cours...");

  server.close(async () => {
    console.log("📴 Serveur HTTP fermé");

    try {
      await sequelize.close();
      await redis.disconnect();
      console.log("✅ Connexions fermées proprement");
    } catch (error) {
      console.error("❌ Erreur lors de la fermeture:", error);
    }

    process.exit(0);
  });
});

// Démarrer le serveur
startServer();
