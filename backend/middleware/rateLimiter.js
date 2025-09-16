// backend/middleware/rateLimiter.js - Version sans Redis
const rateLimit = require("express-rate-limit");

// Rate limiting général (en mémoire)
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requêtes par IP
  message: {
    error: "Trop de requêtes, veuillez réessayer plus tard",
    code: "RATE_LIMIT_EXCEEDED",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting pour l'authentification
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 tentatives de connexion
  message: {
    error: "Trop de tentatives de connexion, veuillez réessayer plus tard",
    code: "AUTH_RATE_LIMIT_EXCEEDED",
  },
  skipSuccessfulRequests: true,
});

// Rate limiting pour les commandes
const orderLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 commandes par minute
  message: {
    error: "Trop de commandes, veuillez patienter",
    code: "ORDER_RATE_LIMIT_EXCEEDED",
  },
});

module.exports = {
  generalLimiter,
  authLimiter,
  orderLimiter,
};
