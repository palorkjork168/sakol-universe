const { Role } = require("../models");

const defaultRoles = [
  {
    name: "ADMIN",
    description: "System administrator",
  },
  {
    name: "JOB_SEEKER",
    description: "User searching for jobs",
  },
  {
    name: "EMPLOYER",
    description: "Company representative",
  },
  {
    name: "EMPLOYEE",
    description: "Company employee",
  },
];

const seedRoles = async () => {
  for (const role of defaultRoles) {
    await Role.findOrCreate({
      where: {
        name: role.name,
      },
      defaults: role,
    });
  }

  console.log("Default roles seeded successfully!");
};

module.exports = seedRoles;