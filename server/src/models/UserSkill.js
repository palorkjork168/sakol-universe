const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const UserSkill = sequelize.define(
  "UserSkill",
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

    skill_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    level: {
      type: DataTypes.ENUM(
        "BEGINNER",
        "INTERMEDIATE",
        "ADVANCED",
        "EXPERT"
      ),
      defaultValue: "BEGINNER",
    },
  },
  {
    tableName: "user_skills",
    timestamps: true,
    underscored: true,
  }
);

module.exports = UserSkill;