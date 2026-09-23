const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const RolePermission = sequelize.define(
  "RolePermission",
  {
    role_id: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    permission_id: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
  },
  {
    tableName: "role_permissions",
    timestamps: true,
    underscored: true,
  }
);

module.exports = RolePermission;
