const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Dish = sequelize.define(
  "Dish",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        len: [2, 100],
        notEmpty: true,
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0.01,
      },
    },
    category_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Category",
        key: "id",
      },
    },
    image_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    preparation_time: {
      type: DataTypes.INTEGER, // en minutes
      defaultValue: 15,
      validate: {
        min: 1,
        max: 120,
      },
    },
    ingredients: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    allergens: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    calories: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 0,
      },
    },
    is_available: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    is_vegetarian: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    is_vegan: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    is_gluten_free: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    sort_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    timestamps: true,
    indexes: [
      { fields: ["name"] },
      { fields: ["category_id"] },
      { fields: ["is_available"] },
      { fields: ["price"] },
    ],
  }
);

module.exports = Dish;