const TableSession = sequelize.define(
  "TableSession",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    table_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Table",
        key: "id",
      },
    },
    customer_name: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    customer_phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    guest_count: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      validate: {
        min: 1,
      },
    },
    started_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    ended_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    total_amount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    status: {
      type: DataTypes.ENUM(
        "active",
        "payment_pending",
        "completed",
        "cancelled"
      ),
      defaultValue: "active",
    },
  },
  {
    timestamps: true,
    indexes: [
      { fields: ["table_id"] },
      { fields: ["status"] },
      { fields: ["started_at"] },
    ],
  }
);

module.exports = TableSession;
