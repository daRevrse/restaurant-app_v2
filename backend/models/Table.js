const Table = sequelize.define(
  "Table",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    number: {
      type: DataTypes.INTEGER,
      unique: true,
      allowNull: false,
      validate: {
        min: 1,
      },
    },
    capacity: {
      type: DataTypes.INTEGER,
      defaultValue: 4,
      validate: {
        min: 1,
        max: 20,
      },
    },
    status: {
      type: DataTypes.ENUM(
        "free",
        "occupied",
        "reserved",
        "cleaning",
        "out_of_service"
      ),
      defaultValue: "free",
    },
    qr_code: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: true,
    },
    position: {
      type: DataTypes.JSON, // {x: number, y: number, zone: string}
      allowNull: true,
    },
    current_session_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    last_cleaned: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    indexes: [
      { fields: ["number"] },
      { fields: ["status"] },
      { fields: ["current_session_id"] },
    ],
  }
);

module.exports = Table;
