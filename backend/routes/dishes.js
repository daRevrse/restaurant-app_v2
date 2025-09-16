const express = require("express");
const multer = require("multer");
const path = require("path");
const { Dish, Category } = require("../models");
const { Op } = require("sequelize");
const {
  authenticateToken,
  authorizeRoles,
  optionalAuth,
} = require("../middleware/auth");
const { validateDish, validateUUIDParam } = require("../middleware/validation");

const router = express.Router();

// Configuration multer pour l'upload d'images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/dishes/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "dish-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Format d'image non supporté"));
    }
  },
});

// Récupérer tous les plats
router.get("/", optionalAuth, async (req, res) => {
  try {
    const { category_id, is_available, search } = req.query;
    const whereClause = {};

    if (category_id) whereClause.category_id = category_id;
    if (is_available !== undefined)
      whereClause.is_available = is_available === "true";
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
    }

    const dishes = await Dish.findAll({
      where: whereClause,
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "name"],
        },
      ],
      order: [
        ["sort_order", "ASC"],
        ["name", "ASC"],
      ],
    });

    res.json({ dishes });
  } catch (error) {
    console.error("Erreur récupération plats:", error);
    res.status(500).json({
      error: "Erreur lors de la récupération des plats",
      code: "DISHES_FETCH_ERROR",
    });
  }
});

// Récupérer un plat par ID
router.get("/:dishId", optionalAuth, validateUUIDParam("dishId"), async (req, res) => {
  try {
    const dish = await Dish.findByPk(req.params.dishId, {
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "name"],
        },
      ],
    });

    if (!dish) {
      return res.status(404).json({
        error: "Plat non trouvé",
        code: "DISH_NOT_FOUND",
      });
    }

    res.json({ dish });
  } catch (error) {
    console.error("Erreur récupération plat:", error);
    res.status(500).json({
      error: "Erreur lors de la récupération du plat",
      code: "DISH_FETCH_ERROR",
    });
  }
});

// Créer un nouveau plat
router.post(
  "/",
  authenticateToken,
  authorizeRoles("admin"),
  upload.single("image"),
  validateDish,
  async (req, res) => {
    try {
      const dishData = { ...req.body };

      if (req.file) {
        dishData.image_url = `/uploads/dishes/${req.file.filename}`;
      }

      const dish = await Dish.create(dishData);

      // Récupérer le plat avec sa catégorie
      const dishWithCategory = await Dish.findByPk(dish.id, {
        include: [{ model: Category, as: "category" }],
      });

      res.status(201).json({
        message: "Plat créé avec succès",
        dish: dishWithCategory,
      });
    } catch (error) {
      console.error("Erreur création plat:", error);
      res.status(400).json({
        error: error.message,
        code: "DISH_CREATION_ERROR",
      });
    }
  }
);

// Mettre à jour un plat
router.put(
  "/:dishId",
  authenticateToken,
  authorizeRoles("admin"),
  validateUUIDParam("dishId"),
  upload.single("image"),
  validateDish,
  async (req, res) => {
    try {
      const dishData = { ...req.body };

      if (req.file) {
        dishData.image_url = `/uploads/dishes/${req.file.filename}`;
      }

      await Dish.update(dishData, { where: { id: req.params.dishId } });

      const updatedDish = await Dish.findByPk(req.params.dishId, {
        include: [{ model: Category, as: "category" }],
      });

      if (!updatedDish) {
        return res.status(404).json({
          error: "Plat non trouvé",
          code: "DISH_NOT_FOUND",
        });
      }

      res.json({
        message: "Plat mis à jour avec succès",
        dish: updatedDish,
      });
    } catch (error) {
      console.error("Erreur mise à jour plat:", error);
      res.status(400).json({
        error: error.message,
        code: "DISH_UPDATE_ERROR",
      });
    }
  }
);

// Supprimer un plat
router.delete(
  "/:dishId",
  authenticateToken,
  authorizeRoles("admin"),
  validateUUIDParam("dishId"),
  async (req, res) => {
    try {
      const dish = await Dish.findByPk(req.params.dishId);

      if (!dish) {
        return res.status(404).json({
          error: "Plat non trouvé",
          code: "DISH_NOT_FOUND",
        });
      }

      await dish.destroy();

      res.json({
        message: "Plat supprimé avec succès",
      });
    } catch (error) {
      console.error("Erreur suppression plat:", error);

      if (error.name === "SequelizeForeignKeyConstraintError") {
        return res.status(400).json({
          error:
            "Impossible de supprimer ce plat car il est référencé dans des commandes",
          code: "DISH_REFERENCED_ERROR",
        });
      }

      res.status(500).json({
        error: "Erreur lors de la suppression",
        code: "DISH_DELETE_ERROR",
      });
    }
  }
);

module.exports = router;