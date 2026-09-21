const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const UserProfile = sequelize.define(
  "UserProfile",
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

    professional_title: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
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
    },

    avatar_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    avatar_public_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    resume_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    resume_public_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "user_profiles",
    timestamps: true,
    underscored: true,
  }
);

module.exports = UserProfile;