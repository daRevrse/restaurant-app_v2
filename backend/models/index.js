const sequelize = require("../config/database");

// Import des modèles
const User = require("./User");
const Category = require("./Category");
const Dish = require("./Dish");
const Table = require("./Table");
const TableSession = require("./TableSession");
const Order = require("./Order");
const OrderItem = require("./OrderItem");
const Payment = require("./Payment");

// ===== DÉFINITION DES ASSOCIATIONS =====

// User associations
User.hasMany(Order, {
  foreignKey: "waiter_id",
  as: "handledOrders",
  onDelete: "SET NULL",
});

User.hasMany(Payment, {
  foreignKey: "processed_by",
  as: "processedPayments",
  onDelete: "SET NULL",
});

// Category associations
Category.hasMany(Dish, {
  foreignKey: "category_id",
  as: "dishes",
  onDelete: "CASCADE",
});

// Dish associations
Dish.belongsTo(Category, {
  foreignKey: "category_id",
  as: "category",
});

Dish.hasMany(OrderItem, {
  foreignKey: "dish_id",
  as: "orderItems",
  onDelete: "RESTRICT", // Empêche la suppression d'un plat commandé
});

// Table associations
Table.hasMany(TableSession, {
  foreignKey: "table_id",
  as: "sessions",
  onDelete: "CASCADE",
});

Table.hasMany(Order, {
  foreignKey: "table_id",
  as: "orders",
  onDelete: "CASCADE",
});

// TableSession associations
TableSession.belongsTo(Table, {
  foreignKey: "table_id",
  as: "table",
});

TableSession.hasMany(Order, {
  foreignKey: "session_id",
  as: "orders",
  onDelete: "CASCADE",
});

TableSession.hasMany(Payment, {
  foreignKey: "session_id",
  as: "payments",
  onDelete: "CASCADE",
});

// Order associations
Order.belongsTo(Table, {
  foreignKey: "table_id",
  as: "table",
});

Order.belongsTo(TableSession, {
  foreignKey: "session_id",
  as: "session",
});

Order.belongsTo(User, {
  foreignKey: "waiter_id",
  as: "waiter",
});

Order.hasMany(OrderItem, {
  foreignKey: "order_id",
  as: "items",
  onDelete: "CASCADE",
});

// OrderItem associations
OrderItem.belongsTo(Order, {
  foreignKey: "order_id",
  as: "order",
});

OrderItem.belongsTo(Dish, {
  foreignKey: "dish_id",
  as: "dish",
});

// Payment associations
Payment.belongsTo(TableSession, {
  foreignKey: "session_id",
  as: "session",
});

Payment.belongsTo(User, {
  foreignKey: "processed_by",
  as: "processor",
});

// Export des modèles
module.exports = {
  sequelize,
  User,
  Category,
  Dish,
  Table,
  TableSession,
  Order,
  OrderItem,
  Payment,
};
