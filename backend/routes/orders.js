const express = require("express");
const { authenticateToken, authorizeRoles } = require("../middleware/auth");
const {
  validateOrder,
  validateUUIDParam,
} = require("../middleware/validation");
const { orderLimiter } = require("../middleware/rateLimiter");
const OrderService = require("../services/orderService");

const router = express.Router();

// Créer une nouvelle commande
router.post(
  "/",
  orderLimiter,
  authenticateToken,
  validateOrder,
  async (req, res) => {
    try {
      const orderService = new OrderService(req.app.get("socketManager"));
      const order = await orderService.createOrder(req.body);

      res.status(201).json({
        message: "Commande créée avec succès",
        order,
      });
    } catch (error) {
      console.error("Erreur création commande:", error);
      res.status(400).json({
        error: error.message,
        code: "ORDER_CREATION_ERROR",
      });
    }
  }
);

// Récupérer une commande par ID
router.get(
  "/:orderId",
  authenticateToken,
  validateUUIDParam("orderId"),
  async (req, res) => {
    try {
      const orderService = new OrderService();
      const order = await orderService.getOrderById(req.params.orderId);

      res.json({ order });
    } catch (error) {
      console.error("Erreur récupération commande:", error);
      res.status(404).json({
        error: error.message,
        code: "ORDER_NOT_FOUND",
      });
    }
  }
);

// Mettre à jour le statut d'une commande
router.patch(
  "/:orderId/status",
  authenticateToken,
  authorizeRoles("waiter", "kitchen", "admin"),
  validateUUIDParam("orderId"),
  async (req, res) => {
    try {
      const { status } = req.body;
      const orderService = new OrderService(req.app.get("socketManager"));

      const order = await orderService.updateOrderStatus(
        req.params.orderId,
        status,
        req.userId
      );

      res.json({
        message: "Statut mis à jour avec succès",
        order,
      });
    } catch (error) {
      console.error("Erreur mise à jour statut:", error);
      res.status(400).json({
        error: error.message,
        code: "STATUS_UPDATE_ERROR",
      });
    }
  }
);

// Récupérer les commandes par statut (pour la cuisine/admin)
router.get(
  "/status/:status",
  authenticateToken,
  authorizeRoles("waiter", "kitchen", "admin"),
  async (req, res) => {
    try {
      const orderService = new OrderService();
      const orders = await orderService.getOrdersByStatus(req.params.status);

      res.json({ orders });
    } catch (error) {
      console.error("Erreur récupération commandes:", error);
      res.status(500).json({
        error: "Erreur lors de la récupération des commandes",
        code: "ORDERS_FETCH_ERROR",
      });
    }
  }
);

// Récupérer les commandes d'une table
router.get(
  "/table/:tableId",
  authenticateToken,
  validateUUIDParam("tableId"),
  async (req, res) => {
    try {
      const orderService = new OrderService();
      const orders = await orderService.getOrdersByTable(
        req.params.tableId,
        req.query.status
      );

      res.json({ orders });
    } catch (error) {
      console.error("Erreur récupération commandes table:", error);
      res.status(500).json({
        error: "Erreur lors de la récupération des commandes",
        code: "TABLE_ORDERS_FETCH_ERROR",
      });
    }
  }
);

// Dashboard stats (admin uniquement)
router.get(
  "/admin/dashboard",
  authenticateToken,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const orderService = new OrderService();
      const stats = await orderService.getDashboardStats();

      res.json({ stats });
    } catch (error) {
      console.error("Erreur stats dashboard:", error);
      res.status(500).json({
        error: "Erreur lors de la récupération des statistiques",
        code: "DASHBOARD_STATS_ERROR",
      });
    }
  }
);

module.exports = router;
