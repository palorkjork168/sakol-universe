const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const JobSkill = sequelize.define(
  "JobSkill",
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

    skill_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    is_required: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "job_skills",
    timestamps: true,
    underscored: true,
  }
);

module.exports = JobSkill;