require('dotenv').config();
const { User, Role } = require('./src/models');

async function checkUsers() {
  try {
    const users = await User.findAll({
      include: [
        {
          model: Role,
          through: { attributes: [] },
          attributes: ['id', 'name'],
        },
      ],
    });

    console.log("=== USERS ===");
    users.forEach(u => {
      console.log(`User ID: ${u.id}`);
      console.log(`User: ${u.email} (${u.first_name} ${u.last_name})`);
      console.log(`Roles: ${u.Roles.map(r => r.name).join(', ')}`);
      console.log("-------------------");
    });
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

checkUsers();
