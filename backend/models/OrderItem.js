const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const OrderItem = sequelize.define(
  "OrderItem",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    order_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Order",
        key: "id",
      },
    },
    dish_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Dish",
        key: "id",
      },
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
      },
    },
    unit_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: "Prix du plat au moment de la commande",
    },
    total_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: "quantity * unit_price",
    },
    special_instructions: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("pending", "preparing", "ready", "served"),
      defaultValue: "pending",
    },
  },
  {
    timestamps: true,
    indexes: [
      { fields: ["order_id"] },
      { fields: ["dish_id"] },
      { fields: ["status"] },
    ],
    hooks: {
      beforeCreate: (orderItem) => {
        orderItem.total_price = orderItem.quantity * orderItem.unit_price;
      },
      beforeUpdate: (orderItem) => {
        if (orderItem.changed("quantity") || orderItem.changed("unit_price")) {
          orderItem.total_price = orderItem.quantity * orderItem.unit_price;
        }
      },
    },
  }
);

module.exports = OrderItem;