const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Interview = sequelize.define(
  "Interview",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    application_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    scheduled_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    duration_minutes: {
      type: DataTypes.INTEGER,
      defaultValue: 30,
      allowNull: false,
    },

    interview_type: {
      type: DataTypes.ENUM("IN_PERSON", "VIDEO", "PHONE"),
      allowNull: false,
      defaultValue: "VIDEO",
    },

    location: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    meeting_link: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    status: {
      type: DataTypes.ENUM(
        "SCHEDULED",
        "COMPLETED",
        "CANCELLED"
      ),
      defaultValue: "SCHEDULED",
      allowNull: false,
    },

    created_by: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    tableName: "interviews",
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ["application_id"],
      },
      {
        fields: ["scheduled_at"],
      },
      {
        fields: ["status"],
      },
    ],
  }
);

module.exports = Interview;
