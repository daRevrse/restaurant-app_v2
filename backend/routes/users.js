const express = require("express");
const { User } = require("../models");
const { authenticateToken, authorizeRoles } = require("../middleware/auth");
const { validateUUIDParam } = require("../middleware/validation");
const { body } = require("express-validator");
const { handleValidationErrors } = require("../middleware/validation");

const router = express.Router();

// Validation pour la mise à jour du profil
const validateProfileUpdate = [
  body("email")
    .optional()
    .isEmail()
    .withMessage("Email invalide")
    .normalizeEmail(),
  body("phone")
    .optional()
    .isMobilePhone()
    .withMessage("Numéro de téléphone invalide"),
  body("currentPassword")
    .if(body("newPassword").exists())
    .notEmpty()
    .withMessage("Mot de passe actuel requis pour changer le mot de passe"),
  body("newPassword")
    .optional()
    .isLength({ min: 6 })
    .withMessage("Le nouveau mot de passe doit contenir au moins 6 caractères"),
  handleValidationErrors,
];

// Récupérer le profil utilisateur connecté
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.userId);

    if (!user) {
      return res.status(404).json({
        error: "Utilisateur non trouvé",
        code: "USER_NOT_FOUND",
      });
    }

    res.json({ user: user.toSafeObject() });
  } catch (error) {
    console.error("Erreur récupération profil:", error);
    res.status(500).json({
      error: "Erreur lors de la récupération du profil",
      code: "PROFILE_FETCH_ERROR",
    });
  }
});

// Mettre à jour le profil utilisateur
router.put(
  "/profile",
  authenticateToken,
  validateProfileUpdate,
  async (req, res) => {
    try {
      const { email, phone, currentPassword, newPassword } = req.body;
      const user = await User.findByPk(req.userId);

      if (!user) {
        return res.status(404).json({
          error: "Utilisateur non trouvé",
          code: "USER_NOT_FOUND",
        });
      }

      // Si changement de mot de passe
      if (newPassword) {
        const isValidPassword = await user.validatePassword(currentPassword);
        if (!isValidPassword) {
          return res.status(400).json({
            error: "Mot de passe actuel incorrect",
            code: "INVALID_CURRENT_PASSWORD",
          });
        }

        await user.update({ password: newPassword });
      }

      // Mise à jour des autres champs
      const updateData = {};
      if (email !== undefined) updateData.email = email;
      if (phone !== undefined) updateData.phone = phone;

      if (Object.keys(updateData).length > 0) {
        await user.update(updateData);
      }

      const updatedUser = await User.findByPk(req.userId);

      res.json({
        message: "Profil mis à jour avec succès",
        user: updatedUser.toSafeObject(),
      });
    } catch (error) {
      console.error("Erreur mise à jour profil:", error);

      if (error.name === "SequelizeUniqueConstraintError") {
        return res.status(409).json({
          error: "Email déjà utilisé par un autre utilisateur",
          code: "EMAIL_ALREADY_EXISTS",
        });
      }

      res.status(500).json({
        error: "Erreur lors de la mise à jour",
        code: "PROFILE_UPDATE_ERROR",
      });
    }
  }
);

// Récupérer tous les utilisateurs (admin uniquement)
router.get(
  "/",
  authenticateToken,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const { role, isActive, search } = req.query;
      const whereClause = {};

      if (role) whereClause.role = role;
      if (isActive !== undefined) whereClause.isActive = isActive === "true";
      if (search) {
        whereClause[Op.or] = [
          { username: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } },
        ];
      }

      const users = await User.findAll({
        where: whereClause,
        attributes: { exclude: ["password", "refreshToken"] },
        order: [["createdAt", "DESC"]],
      });

      res.json({ users });
    } catch (error) {
      console.error("Erreur récupération utilisateurs:", error);
      res.status(500).json({
        error: "Erreur lors de la récupération des utilisateurs",
        code: "USERS_FETCH_ERROR",
      });
    }
  }
);

// Mettre à jour un utilisateur (admin uniquement)
router.put(
  "/:userId",
  authenticateToken,
  authorizeRoles("admin"),
  validateUUIDParam("userId"),
  async (req, res) => {
    try {
      const { role, isActive } = req.body;

      const user = await User.findByPk(req.params.userId);
      if (!user) {
        return res.status(404).json({
          error: "Utilisateur non trouvé",
          code: "USER_NOT_FOUND",
        });
      }

      const updateData = {};
      if (role !== undefined) updateData.role = role;
      if (isActive !== undefined) updateData.isActive = isActive;

      await user.update(updateData);

      res.json({
        message: "Utilisateur mis à jour avec succès",
        user: user.toSafeObject(),
      });
    } catch (error) {
      console.error("Erreur mise à jour utilisateur:", error);
      res.status(500).json({
        error: "Erreur lors de la mise à jour",
        code: "USER_UPDATE_ERROR",
      });
    }
  }
);

// Désactiver un utilisateur (admin uniquement)
router.delete(
  "/:userId",
  authenticateToken,
  authorizeRoles("admin"),
  validateUUIDParam("userId"),
  async (req, res) => {
    try {
      const user = await User.findByPk(req.params.userId);

      if (!user) {
        return res.status(404).json({
          error: "Utilisateur non trouvé",
          code: "USER_NOT_FOUND",
        });
      }

      // Ne pas supprimer, juste désactiver
      await user.update({ isActive: false, refreshToken: null });

      res.json({
        message: "Utilisateur désactivé avec succès",
      });
    } catch (error) {
      console.error("Erreur désactivation utilisateur:", error);
      res.status(500).json({
        error: "Erreur lors de la désactivation",
        code: "USER_DEACTIVATION_ERROR",
      });
    }
  }
);

module.exports = router;
