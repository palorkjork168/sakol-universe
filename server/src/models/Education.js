const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Education = sequelize.define(
  "Education",
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

    institution: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    degree: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    field_of_study: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },

    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },

    is_current: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "educations",
    timestamps: true,
    underscored: true,
  }
);

module.exports = Education;