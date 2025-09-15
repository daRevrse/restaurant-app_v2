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
      customer_name: customerData.customer_name,
      customer_phone: customerData.customer_phone,
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

    return session;
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
        status: "cleaning",
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
}
