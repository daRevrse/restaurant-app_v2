// backend/routes/tables.js - Version complète avec route GET par ID
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
const { Table } = require("../models");

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

// NOUVELLE ROUTE : Récupérer une table par ID ou numéro
router.get("/:identifier", optionalAuth, async (req, res) => {
  try {
    const tableService = new TableService();
    const { identifier } = req.params;

    // Vérifier si c'est un numéro ou un UUID
    let table;
    if (/^\d+$/.test(identifier)) {
      // C'est un numéro de table
      table = await tableService.getTableByNumber(parseInt(identifier));
    } else {
      // C'est probablement un UUID
      table = await tableService.getTableById(identifier);
    }

    if (!table) {
      return res.status(404).json({
        error: "Table non trouvée",
        code: "TABLE_NOT_FOUND",
      });
    }

    res.json({ table });
  } catch (error) {
    console.error("Erreur récupération table:", error);
    res.status(500).json({
      error: "Erreur lors de la récupération de la table",
      code: "TABLE_FETCH_ERROR",
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

router.get("/:identifier", optionalAuth, async (req, res) => {
  try {
    const tableService = new TableService();
    const { identifier } = req.params;

    let table;
    if (/^\d+$/.test(identifier)) {
      // C'est un numéro de table
      table = await Table.findOne({
        where: { number: parseInt(identifier) },
        include: [
          {
            model: TableSession,
            as: "sessions",
            where: { status: "active" },
            required: false,
            limit: 1,
            order: [["started_at", "DESC"]],
          },
        ],
      });
    } else {
      // C'est un UUID
      table = await Table.findByPk(identifier, {
        include: [
          {
            model: TableSession,
            as: "sessions",
            where: { status: "active" },
            required: false,
            limit: 1,
            order: [["started_at", "DESC"]],
          },
        ],
      });
    }

    if (!table) {
      return res.status(404).json({
        error: "Table non trouvée",
        code: "TABLE_NOT_FOUND",
      });
    }

    res.json({ table });
  } catch (error) {
    console.error("Erreur récupération table:", error);
    res.status(500).json({
      error: "Erreur lors de la récupération de la table",
      code: "TABLE_FETCH_ERROR",
    });
  }
});

// Démarrer une session de table
// router.post(
//   "/:tableId/session",
//   optionalAuth, // Permettre aux clients non connectés
//   validateUUIDParam("tableId"),
//   validateTableSession,
//   async (req, res) => {
//     try {
//       const tableService = new TableService();
//       const session = await tableService.startTableSession(
//         req.params.tableId,
//         req.body
//       );

//       res.status(201).json({
//         message: "Session de table démarrée",
//         session,
//       });
//     } catch (error) {
//       console.error("Erreur démarrage session:", error);
//       res.status(400).json({
//         error: error.message,
//         code: "SESSION_START_ERROR",
//       });
//     }
//   }
// );

router.post(
  "/:tableId/session",
  optionalAuth, // Changé de authenticateToken à optionalAuth
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

// NOUVELLE ROUTE : Valider QR Code et récupérer infos table
router.post("/validate-qr", optionalAuth, async (req, res) => {
  try {
    const { qrData } = req.body;

    if (!qrData) {
      return res.status(400).json({
        error: "Données QR Code manquantes",
        code: "MISSING_QR_DATA",
      });
    }

    // Parser les données QR
    let qrInfo;
    try {
      qrInfo = typeof qrData === "string" ? JSON.parse(qrData) : qrData;
    } catch (parseError) {
      return res.status(400).json({
        error: "Format QR Code invalide",
        code: "INVALID_QR_FORMAT",
      });
    }

    const tableService = new TableService();

    // Récupérer la table
    const table = await tableService.getTableByNumber(qrInfo.tableNumber);

    if (!table) {
      return res.status(404).json({
        error: "Table non trouvée",
        code: "TABLE_NOT_FOUND",
      });
    }

    // Vérifier la disponibilité
    if (table.status !== "free") {
      return res.status(409).json({
        error: "Table non disponible",
        code: "TABLE_NOT_AVAILABLE",
        status: table.status,
      });
    }

    // Retourner les infos de la table avec session
    res.json({
      table,
      sessionData: {
        tableId: table.id,
        tableNumber: table.number,
        sessionId: qrInfo.sessionId,
        timestamp: Date.now(),
      },
    });
  } catch (error) {
    console.error("Erreur validation QR:", error);
    res.status(500).json({
      error: "Erreur lors de la validation du QR Code",
      code: "QR_VALIDATION_ERROR",
    });
  }
});

module.exports = router;
