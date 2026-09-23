const { Role } = require("../models");
const { seedPermissions } = require("./seedPermissions");

const defaultRoles = [
  {
    name: "ADMIN",
    description: "System administrator with full platform access",
  },
  {
    name: "JOB_SEEKER",
    description: "User searching and applying for jobs",
  },
  {
    name: "EMPLOYER",
    description: "Company owner and representative",
  },
  {
    name: "EMPLOYEE",
    description: "Company employee",
  },
  {
    name: "HR",
    description: "Human resources specialist managing personnel and leave",
  },
  {
    name: "MANAGER",
    description: "Team manager reviewing subordinates and leave",
  },
  {
    name: "RECRUITER",
    description: "Recruiter managing jobs, candidates, and interviews",
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

  await seedPermissions();
};

module.exports = seedRoles;