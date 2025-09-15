const { body, param, query, validationResult } = require("express-validator");
const { Dish, Table, TableSession } = require("../models");

// Gestionnaire des erreurs de validation
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: "Données invalides",
      code: "VALIDATION_ERROR",
      details: errors.array().map((err) => ({
        field: err.param,
        message: err.msg,
        value: err.value,
      })),
    });
  }
  next();
};

// Validations pour les utilisateurs
const validateUserRegistration = [
  body("username")
    .isLength({ min: 3, max: 50 })
    .withMessage("Le nom d'utilisateur doit contenir entre 3 et 50 caractères")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage(
      "Le nom d'utilisateur ne peut contenir que des lettres, chiffres et underscores"
    ),

  body("email")
    .optional()
    .isEmail()
    .withMessage("Email invalide")
    .normalizeEmail(),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Le mot de passe doit contenir au moins 6 caractères")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre"
    ),

  body("role")
    .optional()
    .isIn(["customer", "waiter", "kitchen", "admin"])
    .withMessage("Rôle invalide"),

  body("phone")
    .optional()
    .isMobilePhone()
    .withMessage("Numéro de téléphone invalide"),

  handleValidationErrors,
];

const validateUserLogin = [
  body("username").notEmpty().withMessage("Nom d'utilisateur requis"),

  body("password").notEmpty().withMessage("Mot de passe requis"),

  handleValidationErrors,
];

// Validations pour les plats
const validateDish = [
  body("name")
    .isLength({ min: 2, max: 100 })
    .withMessage("Le nom du plat doit contenir entre 2 et 100 caractères")
    .trim(),

  body("description")
    .optional()
    .isLength({ max: 1000 })
    .withMessage("La description ne peut pas dépasser 1000 caractères")
    .trim(),

  body("price")
    .isFloat({ min: 0.01 })
    .withMessage("Le prix doit être supérieur à 0")
    .toFloat(),

  body("category_id").isUUID().withMessage("ID de catégorie invalide"),

  body("preparation_time")
    .optional()
    .isInt({ min: 1, max: 120 })
    .withMessage("Le temps de préparation doit être entre 1 et 120 minutes")
    .toInt(),

  body("is_available")
    .optional()
    .isBoolean()
    .withMessage("Disponibilité invalide")
    .toBoolean(),

  body("is_vegetarian").optional().isBoolean().toBoolean(),

  body("is_vegan").optional().isBoolean().toBoolean(),

  body("is_gluten_free").optional().isBoolean().toBoolean(),

  handleValidationErrors,
];

// Validations pour les commandes
const validateOrder = [
  body("table_id")
    .isUUID()
    .withMessage("ID de table invalide")
    .custom(async (value) => {
      const table = await Table.findByPk(value);
      if (!table) {
        throw new Error("Table non trouvée");
      }
      if (table.status !== "occupied") {
        throw new Error("Table non disponible pour commander");
      }
      return true;
    }),

  body("session_id")
    .isUUID()
    .withMessage("ID de session invalide")
    .custom(async (value) => {
      const session = await TableSession.findByPk(value);
      if (!session) {
        throw new Error("Session non trouvée");
      }
      if (session.status !== "active") {
        throw new Error("Session non active");
      }
      return true;
    }),

  body("items").isArray({ min: 1 }).withMessage("Au moins un item requis"),

  body("items.*.dish_id")
    .isUUID()
    .withMessage("ID de plat invalide")
    .custom(async (value) => {
      const dish = await Dish.findByPk(value);
      if (!dish) {
        throw new Error("Plat non trouvé");
      }
      if (!dish.is_available) {
        throw new Error("Plat non disponible");
      }
      return true;
    }),

  body("items.*.quantity")
    .isInt({ min: 1, max: 20 })
    .withMessage("Quantité invalide (1-20)")
    .toInt(),

  body("special_instructions")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Instructions spéciales trop longues (max 500 caractères)")
    .trim(),

  handleValidationErrors,
];

// Validations pour les tables
const validateTable = [
  body("number")
    .isInt({ min: 1 })
    .withMessage("Numéro de table invalide")
    .toInt(),

  body("capacity")
    .optional()
    .isInt({ min: 1, max: 20 })
    .withMessage("Capacité invalide (1-20)")
    .toInt(),

  body("status")
    .optional()
    .isIn(["free", "occupied", "reserved", "cleaning", "out_of_service"])
    .withMessage("Statut de table invalide"),

  handleValidationErrors,
];

// Validations pour les sessions de table
const validateTableSession = [
  body("table_id").isUUID().withMessage("ID de table invalide"),

  body("customer_name")
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage("Nom client invalide")
    .trim(),

  body("customer_phone")
    .optional()
    .isMobilePhone()
    .withMessage("Téléphone client invalide"),

  body("guest_count")
    .isInt({ min: 1, max: 20 })
    .withMessage("Nombre de convives invalide (1-20)")
    .toInt(),

  handleValidationErrors,
];

// Validations pour les paiements
const validatePayment = [
  body("session_id").isUUID().withMessage("ID de session invalide"),

  body("payment_method")
    .isIn(["cash", "card", "mobile_money", "bank_transfer"])
    .withMessage("Méthode de paiement invalide"),

  body("amount")
    .isFloat({ min: 0.01 })
    .withMessage("Montant invalide")
    .toFloat(),

  handleValidationErrors,
];

// Validations pour les paramètres d'URL
const validateUUIDParam = (paramName) => [
  param(paramName).isUUID().withMessage(`${paramName} invalide`),
  handleValidationErrors,
];

module.exports = {
  validateUserRegistration,
  validateUserLogin,
  validateDish,
  validateOrder,
  validateTable,
  validateTableSession,
  validatePayment,
  validateUUIDParam,
  handleValidationErrors,
};
