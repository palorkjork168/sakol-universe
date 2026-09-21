const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Application = sequelize.define(
  "Application",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    job_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    cover_letter: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    cv_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    status: {
      type: DataTypes.ENUM(
        "PENDING",
        "REVIEWING",
        "INTERVIEW",
        "ACCEPTED",
        "REJECTED",
        "WITHDRAWN"
      ),
      defaultValue: "PENDING",
      allowNull: false,
    },
  },
  {
    tableName: "applications",
    timestamps: true,
    underscored: true,

    indexes: [
      {
        unique: true,
        fields: ["job_id", "user_id"],
      },
    ],
  }
);

module.exports = Application;