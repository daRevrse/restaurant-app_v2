const express = require("express");
const jwt = require("jsonwebtoken");
const { User } = require("../models");
const {
  validateUserRegistration,
  validateUserLogin,
} = require("../middleware/validation");
const { authLimiter } = require("../middleware/rateLimiter");

const router = express.Router();

// Inscription
router.post(
  "/register",
  authLimiter,
  validateUserRegistration,
  async (req, res) => {
    try {
      const { username, email, password, role, phone } = req.body;

      // Vérifier l'unicité
      const existingUser = await User.findOne({
        where: {
          [Op.or]: [{ username }, ...(email ? [{ email }] : [])],
        },
      });

      if (existingUser) {
        return res.status(409).json({
          error: "Nom d'utilisateur ou email déjà utilisé",
          code: "USER_EXISTS",
        });
      }

      // Créer l'utilisateur
      const user = await User.create({
        username,
        email,
        password,
        role: role || "customer",
        phone,
      });

      // Générer les tokens
      const { accessToken, refreshToken } = generateTokens(user);

      // Sauvegarder le refresh token
      await user.update({ refreshToken });

      res.status(201).json({
        message: "Utilisateur créé avec succès",
        user: user.toSafeObject(),
        accessToken,
        refreshToken,
      });
    } catch (error) {
      console.error("Erreur inscription:", error);
      res.status(500).json({
        error: "Erreur lors de l'inscription",
        code: "REGISTRATION_ERROR",
      });
    }
  }
);

// Connexion
router.post("/login", authLimiter, validateUserLogin, async (req, res) => {
  try {
    const { username, password } = req.body;

    // Trouver l'utilisateur
    const user = await User.findOne({ where: { username } });

    if (!user || !user.isActive) {
      return res.status(401).json({
        error: "Utilisateur non trouvé ou inactif",
        code: "USER_NOT_FOUND",
      });
    }

    // Vérifier le mot de passe
    const isValidPassword = await user.validatePassword(password);

    if (!isValidPassword) {
      return res.status(401).json({
        error: "Mot de passe incorrect",
        code: "INVALID_PASSWORD",
      });
    }

    // Générer les tokens
    const { accessToken, refreshToken } = generateTokens(user);

    // Mettre à jour le refresh token
    await user.update({ refreshToken: newRefreshToken });

    res.json({
      accessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    console.error("Erreur refresh token:", error);
    res.status(401).json({
      error: "Token invalide",
      code: "TOKEN_REFRESH_ERROR",
    });
  }
});

// Déconnexion
router.post("/logout", async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      // Invalider le refresh token
      await User.update({ refreshToken: null }, { where: { refreshToken } });
    }

    res.json({ message: "Déconnexion réussie" });
  } catch (error) {
    console.error("Erreur déconnexion:", error);
    res.status(500).json({
      error: "Erreur lors de la déconnexion",
      code: "LOGOUT_ERROR",
    });
  }
});

// Fonction utilitaire pour générer les tokens
function generateTokens(user) {
  const payload = {
    id: user.id,
    username: user.username,
    role: user.role,
  };

  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1h",
  });

  const refreshToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  });

  return { accessToken, refreshToken };
}

module.exports = router;
