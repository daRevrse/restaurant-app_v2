const express = require('express');
const { Category, Dish } = require('../models');
const { authenticateToken, authorizeRoles, optionalAuth } = require('../middleware/auth');
const { body } = require('express-validator');
const { handleValidationErrors } = require('../middleware/validation');
const { Op } = require('sequelize');

const router = express.Router();

// Validation pour les catégories
const validateCategory = [
  body('name')
    .isLength({ min: 2, max: 100 })
    .withMessage('Le nom doit contenir entre 2 et 100 caractères')
    .trim(),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('La description ne peut pas dépasser 500 caractères')
    .trim(),
  body('icon')
    .optional()
    .isLength({ max: 50 })
    .withMessage('L\'icône ne peut pas dépasser 50 caractères'),
  body('sort_order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('L\'ordre de tri doit être un entier positif')
    .toInt(),
  handleValidationErrors
];

// Récupérer toutes les catégories
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { include_dishes = false } = req.query;
    
    const includeOptions = [];
    if (include_dishes === 'true') {
      includeOptions.push({
        model: Dish,
        as: 'dishes',
        where: { is_available: true },
        required: false,
        attributes: ['id', 'name', 'price', 'image_url', 'is_vegetarian', 'is_vegan']
      });
    }

    const categories = await Category.findAll({
      where: { isActive: true },
      include: includeOptions,
      order: [['sort_order', 'ASC'], ['name', 'ASC']]
    });

    res.json({ categories });

  } catch (error) {
    console.error('Erreur récupération catégories:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération des catégories',
      code: 'CATEGORIES_FETCH_ERROR'
    });
  }
});

// Récupérer une catégorie par ID
router.get('/:categoryId', optionalAuth, async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.categoryId, {
      include: [
        {
          model: Dish,
          as: 'dishes',
          where: { is_available: true },
          required: false
        }
      ]
    });

    if (!category) {
      return res.status(404).json({
        error: 'Catégorie non trouvée',
        code: 'CATEGORY_NOT_FOUND'
      });
    }

    res.json({ category });

  } catch (error) {
    console.error('Erreur récupération catégorie:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération de la catégorie',
      code: 'CATEGORY_FETCH_ERROR'
    });
  }
});

// Créer une nouvelle catégorie
router.post('/',
  authenticateToken,
  authorizeRoles('admin'),
  validateCategory,
  async (req, res) => {
    try {
      const { name, description, icon, sort_order } = req.body;

      // Vérifier l'unicité du nom
      const existingCategory = await Category.findOne({ where: { name } });
      if (existingCategory) {
        return res.status(409).json({
          error: 'Une catégorie avec ce nom existe déjà',
          code: 'CATEGORY_NAME_EXISTS'
        });
      }

      const category = await Category.create({
        name,
        description,
        icon,
        sort_order: sort_order || 0
      });

      res.status(201).json({
        message: 'Catégorie créée avec succès',
        category
      });

    } catch (error) {
      console.error('Erreur création catégorie:', error);
      res.status(400).json({
        error: error.message,
        code: 'CATEGORY_CREATION_ERROR'
      });
    }
  }
);

// Mettre à jour une catégorie
router.put('/:categoryId',
  authenticateToken,
  authorizeRoles('admin'),
  validateCategory,
  async (req, res) => {
    try {
      const { name, description, icon, sort_order, isActive } = req.body;

      // Vérifier que la catégorie existe
      const category = await Category.findByPk(req.params.categoryId);
      if (!category) {
        return res.status(404).json({
          error: 'Catégorie non trouvée',
          code: 'CATEGORY_NOT_FOUND'
        });
      }

      // Vérifier s'il y a des plats dans cette catégorie
      const dishCount = await Dish.count({ where: { category_id: req.params.categoryId } });
      
      if (dishCount > 0) {
        return res.status(400).json({
          error: 'Impossible de supprimer une catégorie contenant des plats',
          code: 'CATEGORY_HAS_DISHES',
          dishCount
        });
      }

      await category.destroy();

      res.json({
        message: 'Catégorie supprimée avec succès'
      });

    } catch (error) {
      console.error('Erreur suppression catégorie:', error);
      res.status(500).json({
        error: 'Erreur lors de la suppression',
        code: 'CATEGORY_DELETE_ERROR'
      });
    }
  }
);

// Exécuter si appelé directement
if (require.main === module) {
    sequelize.sync({ force: false })
      .then(() => seedDatabase())
      .then(() => process.exit(0))
      .catch(error => {
        console.error(error);
        process.exit(1);
      });
  }
          });
        }
  
        // Vérifier l'unicité du nom (sauf pour la catégorie actuelle)
        if (name !== category.name) {
          const existingCategory = await Category.findOne({
            where: {
              name,
              id: { [Op.ne]: req.params.categoryId }
            }
          });
          
          if (existingCategory) {
            return res.status(409).json({
              error: 'Une catégorie avec ce nom existe déjà',
              code: 'CATEGORY_NAME_EXISTS'
            });
          }
        }
  
        await category.update({
          name,
          description,
          icon,
          sort_order,
          isActive
        });
  
        res.json({
          message: 'Catégorie mise à jour avec succès',
          category
        });
  
      } catch (error) {
        console.error('Erreur mise à jour catégorie:', error);
        res.status(400).json({
          error: error.message,
          code: 'CATEGORY_UPDATE_ERROR'
        });
      }
    }
  );
  
  // Supprimer une catégorie
  router.delete('/:categoryId',
    authenticateToken,
    authorizeRoles('admin'),
    async (req, res) => {
      try {
        const category = await Category.findByPk(req.params.categoryId);
        
        if (!category) {
          return res.status(404).json({
            error: 'Catégorie non trouvée',
            code: 'CATEGORY_NOT_FOUND'

module.exports = router;