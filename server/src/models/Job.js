const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Job = sequelize.define(
  "Job",
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

    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    requirements: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    responsibilities: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    employment_type: {
      type: DataTypes.ENUM(
        "FULL_TIME",
        "PART_TIME",
        "INTERNSHIP",
        "CONTRACT",
        "FREELANCE"
      ),
      allowNull: false,
    },

    experience_level: {
      type: DataTypes.ENUM(
        "ENTRY",
        "JUNIOR",
        "MID",
        "SENIOR",
        "LEAD"
      ),
      allowNull: true,
    },

    salary_min: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
    },

    salary_max: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
    },

    salary_currency: {
      type: DataTypes.STRING,
      defaultValue: "USD",
    },

    location: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    is_remote: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    application_deadline: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    status: {
      type: DataTypes.ENUM(
        "DRAFT",
        "PUBLISHED",
        "CLOSED"
      ),
      defaultValue: "DRAFT",
    },
  },
  {
    tableName: "jobs",
    timestamps: true,
    underscored: true,
  }
);

module.exports = Job;