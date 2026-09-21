require('dotenv').config();
const bcrypt = require('bcryptjs');
const sequelize = require('./src/config/database');
const User = require('./src/models/User');
const Role = require('./src/models/Role');
const UserRole = require('./src/models/UserRole');

async function createAccounts() {
  await sequelize.authenticate();
  const password = await bcrypt.hash('password123', 10);
  
  const adminRole = await Role.findOne({ where: { name: 'ADMIN' }});
  const employeeRole = await Role.findOne({ where: { name: 'EMPLOYEE' }});
  
  const [admin] = await User.findOrCreate({
    where: { email: 'admin_qa@test.com' },
    defaults: { first_name: 'Admin', last_name: 'QA', email: 'admin_qa@test.com', password_hash: password }
  });
  await UserRole.findOrCreate({ where: { user_id: admin.id, role_id: adminRole.id } });

  const [employee] = await User.findOrCreate({
    where: { email: 'emp_qa@test.com' },
    defaults: { first_name: 'Employee', last_name: 'QA', email: 'emp_qa@test.com', password_hash: password }
  });
  await UserRole.findOrCreate({ where: { user_id: employee.id, role_id: employeeRole.id } });

  console.log("Created admin_qa@test.com and emp_qa@test.com");
  process.exit(0);
}

createAccounts();
