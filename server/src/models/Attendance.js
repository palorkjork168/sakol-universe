const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Attendance = sequelize.define(
  "Attendance",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    check_in_time: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    check_in_lat: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: false,
    },
    check_in_long: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: false,
    },
    check_out_time: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    check_out_lat: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: true,
    },
    check_out_long: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: true,
    },
  },
  {
    tableName: "attendances",
    timestamps: true,
    underscored: true,
  }
);

module.exports = Attendance;
