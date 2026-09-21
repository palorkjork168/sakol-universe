const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Company = sequelize.define(
  "Company",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    owner_id: {
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

    logo_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    website: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    email: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: true,
      },
    },

    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    city: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    country: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "Cambodia",
    },

    industry: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    company_size: {
      type: DataTypes.ENUM(
        "1-10",
        "11-50",
        "51-200",
        "201-500",
        "500+"
      ),
      allowNull: true,
    },

    status: {
      type: DataTypes.ENUM(
        "PENDING",
        "ACTIVE",
        "SUSPENDED"
      ),
      defaultValue: "PENDING",
    },
  },
  {
    tableName: "companies",
    timestamps: true,
    underscored: true,
  }
);

module.exports = Company;