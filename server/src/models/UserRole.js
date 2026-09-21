const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const UserRole = sequelize.define(
  "UserRole",
  {
    user_id: {
      type: DataTypes.UUID,
      primaryKey: true,
    },

    role_id: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
  },
  {
    tableName: "user_roles",
    timestamps: true,
    underscored: true,
  }
);

module.exports = UserRole;