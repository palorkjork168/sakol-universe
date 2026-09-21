require('dotenv').config();
const { User, Role, UserRole } = require('./src/models');

async function assignAdmin(email) {
  try {
    if (!email) {
      console.log("Please provide an email address. Example: node assign_admin.js test@example.com");
      process.exit(1);
    }

    // Find the user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      console.log(`User with email ${email} not found.`);
      process.exit(1);
    }

    // Find the ADMIN role
    const adminRole = await Role.findOne({ where: { name: 'ADMIN' } });
    if (!adminRole) {
      console.log("ADMIN role does not exist in the database. Please run your seeders first.");
      process.exit(1);
    }

    // Assign the role (findOrCreate to avoid duplicates)
    await UserRole.findOrCreate({
      where: {
        user_id: user.id,
        role_id: adminRole.id
      }
    });

    console.log(`Success! The ADMIN role has been assigned to ${email}.`);
    process.exit(0);
  } catch (error) {
    console.error("An error occurred:", error);
    process.exit(1);
  }
}

const emailArgs = process.argv[2];
assignAdmin(emailArgs);
