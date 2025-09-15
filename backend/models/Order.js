const Order = sequelize.define(
  "Order",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    order_number: {
      type: DataTypes.STRING(20),
      unique: true,
      allowNull: false,
    },
    table_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Table",
        key: "id",
      },
    },
    session_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "TableSession",
        key: "id",
      },
    },
    waiter_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "User",
        key: "id",
      },
    },
    status: {
      type: DataTypes.ENUM(
        "pending",
        "confirmed",
        "preparing",
        "ready",
        "served",
        "completed",
        "cancelled"
      ),
      defaultValue: "pending",
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    tax_amount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    discount_amount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    total_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    estimated_time: {
      type: DataTypes.INTEGER, // en minutes
      allowNull: true,
    },
    special_instructions: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    ordered_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    confirmed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    ready_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    served_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    indexes: [
      { fields: ["order_number"] },
      { fields: ["table_id"] },
      { fields: ["session_id"] },
      { fields: ["status"] },
      { fields: ["ordered_at"] },
    ],
    hooks: {
      beforeCreate: async (order) => {
        // Générer un numéro de commande unique
        const date = new Date();
        const timestamp = date.getTime().toString().slice(-6);
        order.order_number = `ORD-${timestamp}`;
      },
    },
  }
);

module.exports = Order;
