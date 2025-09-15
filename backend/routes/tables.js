const express = require("express");
const {
  authenticateToken,
  authorizeRoles,
  optionalAuth,
} = require("../middleware/auth");
const {
  validateTable,
  validateTableSession,
  validateUUIDParam,
} = require("../middleware/validation");
const TableService = require("../services/tableService");

const router = express.Router();

// Créer une nouvelle table
router.post(
  "/",
  authenticateToken,
  authorizeRoles("admin"),
  validateTable,
  async (req, res) => {
    try {
      const tableService = new TableService();
      const table = await tableService.createTable(req.body);

      res.status(201).json({
        message: "Table créée avec succès",
        table,
      });
    } catch (error) {
      console.error("Erreur création table:", error);
      res.status(400).json({
        error: error.message,
        code: "TABLE_CREATION_ERROR",
      });
    }
  }
);

// Récupérer toutes les tables
router.get("/", optionalAuth, async (req, res) => {
  try {
    const tableService = new TableService();
    const tables = await tableService.getTablesByStatus(req.query.status);

    res.json({ tables });
  } catch (error) {
    console.error("Erreur récupération tables:", error);
    res.status(500).json({
      error: "Erreur lors de la récupération des tables",
      code: "TABLES_FETCH_ERROR",
    });
  }
});

// Mettre à jour le statut d'une table
router.patch(
  "/:tableId/status",
  authenticateToken,
  authorizeRoles("waiter", "admin"),
  validateUUIDParam("tableId"),
  async (req, res) => {
    try {
      const { status, notes } = req.body;
      const tableService = new TableService();

      const table = await tableService.updateTableStatus(
        req.params.tableId,
        status,
        notes
      );

      // Notifier via WebSocket
      const socketManager = req.app.get("socketManager");
      if (socketManager) {
        socketManager.notifyTableStatusUpdate(table);
      }

      res.json({
        message: "Statut de table mis à jour",
        table,
      });
    } catch (error) {
      console.error("Erreur mise à jour table:", error);
      res.status(400).json({
        error: error.message,
        code: "TABLE_UPDATE_ERROR",
      });
    }
  }
);

// Démarrer une session de table
router.post(
  "/:tableId/session",
  authenticateToken,
  validateUUIDParam("tableId"),
  validateTableSession,
  async (req, res) => {
    try {
      const tableService = new TableService();
      const session = await tableService.startTableSession(
        req.params.tableId,
        req.body
      );

      res.status(201).json({
        message: "Session de table démarrée",
        session,
      });
    } catch (error) {
      console.error("Erreur démarrage session:", error);
      res.status(400).json({
        error: error.message,
        code: "SESSION_START_ERROR",
      });
    }
  }
);

// Terminer une session de table
router.patch(
  "/session/:sessionId/end",
  authenticateToken,
  authorizeRoles("waiter", "admin"),
  validateUUIDParam("sessionId"),
  async (req, res) => {
    try {
      const tableService = new TableService();
      const session = await tableService.endTableSession(
        req.params.sessionId,
        req.body
      );

      res.json({
        message: "Session terminée avec succès",
        session,
      });
    } catch (error) {
      console.error("Erreur fin session:", error);
      res.status(400).json({
        error: error.message,
        code: "SESSION_END_ERROR",
      });
    }
  }
);

module.exports = router;
