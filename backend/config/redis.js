// backend/config/redis.js - Version simplifiée
const redis = require("redis");

let client = null;

try {
  client = redis.createClient({
    host: process.env.REDIS_HOST || "localhost",
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    // Configuration pour éviter les erreurs de connexion
    socket: {
      connectTimeout: 5000,
      reconnectDelay: 1000,
    },
    // Ne pas faire crasher l'app si Redis n'est pas disponible
    lazyConnect: true,
  });

  client.on("error", (err) => {
    console.warn("⚠️  Redis Client Error:", err.message);
    console.warn("L'application continuera sans Redis");
  });

  client.on("connect", () => {
    console.log("✅ Redis connected successfully");
  });

  client.on("disconnect", () => {
    console.log("🔌 Redis disconnected");
  });
} catch (error) {
  console.warn("⚠️  Redis configuration error:", error.message);
  console.warn("L'application démarrera sans Redis");
}

// Fonction helper pour vérifier la connexion Redis
async function isRedisAvailable() {
  if (!client) return false;

  try {
    if (!client.isOpen) {
      await client.connect();
    }
    await client.ping();
    return true;
  } catch (error) {
    console.warn("Redis non disponible:", error.message);
    return false;
  }
}

// Fonction pour se connecter à Redis de manière sécurisée
async function connectSafely() {
  if (!client) {
    console.log("⚠️  Redis client non configuré");
    return false;
  }

  try {
    if (!client.isOpen) {
      await client.connect();
      console.log("✅ Redis connecté");
      return true;
    }
    return true;
  } catch (error) {
    console.warn("⚠️  Impossible de se connecter à Redis:", error.message);
    console.warn("L'application continuera sans Redis");
    return false;
  }
}

// Fonction pour se déconnecter proprement
async function disconnect() {
  if (client && client.isOpen) {
    try {
      await client.disconnect();
      console.log("✅ Redis déconnecté proprement");
    } catch (error) {
      console.warn("Erreur lors de la déconnexion Redis:", error.message);
    }
  }
}

module.exports = {
  client,
  isRedisAvailable,
  connect: connectSafely,
  disconnect,
};
