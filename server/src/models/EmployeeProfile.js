const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const EmployeeProfile = sequelize.define(
  "EmployeeProfile",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
    },
    department: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    joined_date: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "employee_profiles",
    timestamps: true,
    underscored: true,
  }
);

module.exports = EmployeeProfile;
