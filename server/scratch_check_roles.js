require('dotenv').config();
const { Role } = require('./src/models');

async function checkRoles() {
  try {
    const roles = await Role.findAll();

    console.log("=== ROLES ===");
    roles.forEach(r => {
      console.log(`Role: ${r.name} (ID: ${r.id})`);
    });
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

checkRoles();
