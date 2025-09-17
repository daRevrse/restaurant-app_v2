// backend/services/tableService.js - Version complète avec méthodes manquantes
const { Table, TableSession } = require("../models");
const QRCode = require("qrcode");
const crypto = require("crypto");

class TableService {
  async createTable(tableData) {
    const { number, capacity, position } = tableData;

    // Vérifier l'unicité du numéro
    const existingTable = await Table.findOne({ where: { number } });
    if (existingTable) {
      throw new Error("Numéro de table déjà utilisé");
    }

    // Générer un QR code unique
    const qrCode = await this.generateQRCode(number);

    const table = await Table.create({
      number,
      capacity: capacity || 4,
      position,
      qr_code: qrCode,
      status: "free",
    });

    return table;
  }

  async generateQRCode(tableNumber) {
    const sessionId = crypto.randomBytes(16).toString("hex");
    const qrData = {
      tableNumber,
      sessionId,
      restaurantId: "restaurant_001", // ID du restaurant
      timestamp: Date.now(),
    };

    const qrCodeData = JSON.stringify(qrData);
    const qrCodeImage = await QRCode.toDataURL(qrCodeData);

    return qrCodeImage;
  }

  // NOUVELLE MÉTHODE : Récupérer table par ID
  async getTableById(tableId) {
    return await Table.findByPk(tableId, {
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

  // NOUVELLE MÉTHODE : Récupérer table par numéro
  async getTableByNumber(tableNumber) {
    return await Table.findOne({
      where: { number: tableNumber },
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

  async updateTableStatus(tableId, newStatus, notes = null) {
    const validStatuses = [
      "free",
      "occupied",
      "reserved",
      "cleaning",
      "out_of_service",
    ];

    if (!validStatuses.includes(newStatus)) {
      throw new Error("Statut de table invalide");
    }

    const updateData = { status: newStatus };
    if (notes) updateData.notes = notes;
    if (newStatus === "cleaning") updateData.last_cleaned = new Date();

    await Table.update(updateData, { where: { id: tableId } });

    const updatedTable = await Table.findByPk(tableId);
    return updatedTable;
  }

  async startTableSession(tableId, customerData) {
    const table = await Table.findByPk(tableId);

    if (!table) {
      throw new Error("Table non trouvée");
    }

    if (table.status !== "free") {
      throw new Error("Table non disponible");
    }

    // Créer une nouvelle session
    const session = await TableSession.create({
      table_id: tableId,
      customer_name: customerData.customer_name || "Client",
      customer_phone: customerData.customer_phone || null,
      guest_count: customerData.guest_count || 1,
      status: "active",
    });

    // Mettre à jour le statut de la table
    await Table.update(
      {
        status: "occupied",
        current_session_id: session.id,
      },
      { where: { id: tableId } }
    );

    // Recharger la session avec les relations
    const completeSession = await TableSession.findByPk(session.id, {
      include: [
        {
          model: Table,
          as: "table",
          attributes: ["id", "number", "capacity"],
        },
      ],
    });

    return completeSession;
  }

  async endTableSession(sessionId, paymentData = null) {
    const session = await TableSession.findByPk(sessionId, {
      include: [{ model: Table, as: "table" }],
    });

    if (!session) {
      throw new Error("Session non trouvée");
    }

    // Mettre à jour la session
    await TableSession.update(
      {
        ended_at: new Date(),
        status: "completed",
        total_amount: paymentData?.total_amount || session.total_amount,
      },
      { where: { id: sessionId } }
    );

    // Libérer la table
    await Table.update(
      {
        status: "cleaning", // Mettre en nettoyage plutôt que libre
        current_session_id: null,
      },
      { where: { id: session.table_id } }
    );

    return session;
  }

  async getTablesByStatus(status = null) {
    const whereClause = status ? { status } : {};

    return await Table.findAll({
      where: whereClause,
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
      order: [["number", "ASC"]],
    });
  }

  // NOUVELLE MÉTHODE : Valider disponibilité table
  async validateTableAvailability(tableNumber) {
    const table = await this.getTableByNumber(tableNumber);

    if (!table) {
      throw new Error("Table non trouvée");
    }

    if (table.status !== "free") {
      throw new Error(
        `Table ${tableNumber} n'est pas disponible (statut: ${table.status})`
      );
    }

    return table;
  }

  // NOUVELLE MÉTHODE : Obtenir statistiques des tables
  async getTableStats() {
    const stats = await Table.findAll({
      attributes: [
        "status",
        [Table.sequelize.fn("COUNT", Table.sequelize.col("id")), "count"],
      ],
      group: ["status"],
    });

    const totalTables = await Table.count();

    return {
      total: totalTables,
      byStatus: stats.reduce((acc, stat) => {
        acc[stat.status] = parseInt(stat.dataValues.count);
        return acc;
      }, {}),
    };
  }

  // NOUVELLE MÉTHODE : Recherche de tables disponibles
  async findAvailableTables(capacity = null) {
    const whereClause = { status: "free" };

    if (capacity) {
      whereClause.capacity = { [Table.sequelize.Op.gte]: capacity };
    }

    return await Table.findAll({
      where: whereClause,
      order: [["number", "ASC"]],
    });
  }
}

module.exports = TableService;
