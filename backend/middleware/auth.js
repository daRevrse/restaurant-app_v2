const jwt = require("jsonwebtoken");
const { User } = require("../models");

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: "Token d'accès requis",
        code: "TOKEN_MISSING",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Vérifier que l'utilisateur existe toujours
    const user = await User.findByPk(decoded.id);
    if (!user || !user.isActive) {
      return res.status(401).json({
        error: "Utilisateur non trouvé ou inactif",
        code: "USER_INVALID",
      });
    }

    req.user = user.toSafeObject();
    req.userId = decoded.id;
    req.userRole = decoded.role;

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        error: "Token expiré",
        code: "TOKEN_EXPIRED",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        error: "Token invalide",
        code: "TOKEN_INVALID",
      });
    }

    console.error("Auth middleware error:", error);
    return res.status(500).json({
      error: "Erreur d'authentification",
      code: "AUTH_ERROR",
    });
  }
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.userRole || !roles.includes(req.userRole)) {
      return res.status(403).json({
        error: "Accès refusé - Permissions insuffisantes",
        code: "INSUFFICIENT_PERMISSIONS",
        requiredRoles: roles,
        userRole: req.userRole,
      });
    }
    next();
  };
};

// Middleware optionnel d'authentification (pour les routes publiques)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.id);

      if (user && user.isActive) {
        req.user = user.toSafeObject();
        req.userId = decoded.id;
        req.userRole = decoded.role;
      }
    }

    next();
  } catch (error) {
    // En cas d'erreur, on continue sans authentification
    next();
  }
};

module.exports = {
  authenticateToken,
  authorizeRoles,
  optionalAuth,
};
