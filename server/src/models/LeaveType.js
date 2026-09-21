const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const LeaveType = sequelize.define(
  "LeaveType",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    company_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    default_days: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    is_paid: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    requires_document: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "leave_types",
    timestamps: true,
    underscored: true,
  }
);

module.exports = LeaveType;
