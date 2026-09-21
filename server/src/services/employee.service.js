const { User, EmployeeProfile, Role } = require("../models");
const sequelize = require("../config/database");
const bcrypt = require("bcryptjs");

const getAllEmployees = async () => {
  const employees = await User.findAll({
    include: [
      {
        model: EmployeeProfile,
        as: "employeeProfile",
        required: true,
      },
      {
        model: Role,
        through: { attributes: [] },
      },
    ],
    attributes: { exclude: ["password_hash"] },
  });

  return employees;
};

const getEmployeeById = async (employeeId) => {
  const employee = await User.findOne({
    where: { id: employeeId },
    include: [
      {
        model: EmployeeProfile,
        as: "employeeProfile",
        required: true,
      },
      {
        model: Role,
        through: { attributes: [] },
      },
    ],
    attributes: { exclude: ["password_hash"] },
  });

  if (!employee) {
    const error = new Error("Employee not found");
    error.statusCode = 404;
    throw error;
  }

  return employee;
};

const createEmployee = async (employeeData) => {
  const { first_name, last_name, email, password, phone, department } = employeeData;

  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    const error = new Error("Email already registered");
    error.statusCode = 409;
    throw error;
  }

  const password_hash = await bcrypt.hash(password, 12);

  const createdUserId = await sequelize.transaction(async (t) => {
    const user = await User.create({
      first_name,
      last_name,
      email,
      password_hash,
      phone,
    }, { transaction: t });

    await EmployeeProfile.create({
      user_id: user.id,
      department,
    }, { transaction: t });

    let employeeRole = await Role.findOne({
      where: { name: "EMPLOYEE" },
      transaction: t,
    });
    
    if (!employeeRole) {
      employeeRole = await Role.create({
        name: "EMPLOYEE",
        description: "Internal Employee",
      }, { transaction: t });
    }

    await user.addRole(employeeRole, { transaction: t });

    return user.id;
  });

  const newEmployee = await getEmployeeById(createdUserId);
  return newEmployee;
};

const updateEmployeeRole = async (employeeId, roleName) => {
  const user = await User.findByPk(employeeId);
  
  if (!user) {
    const error = new Error("Employee not found");
    error.statusCode = 404;
    throw error;
  }

  let role = await Role.findOne({ where: { name: roleName } });
  
  if (!role) {
    role = await Role.create({
      name: roleName,
    });
  }
  
  await user.setRoles([role]);

  return user;
};

const updateEmployeeStatus = async (employeeId, status) => {
  const user = await User.findByPk(employeeId);
  
  if (!user) {
    const error = new Error("Employee not found");
    error.statusCode = 404;
    throw error;
  }

  user.status = status;
  await user.save();

  return user;
};

const updateEmployee = async (employeeId, updateData) => {
  const { first_name, last_name, phone, department } = updateData;

  const existingUser = await User.findByPk(employeeId, {
    include: [{ model: EmployeeProfile, as: "employeeProfile" }],
  });

  if (!existingUser || !existingUser.employeeProfile) {
    const error = new Error("Employee not found");
    error.statusCode = 404;
    throw error;
  }

  await sequelize.transaction(async (t) => {
    const userUpdates = {};
    if (first_name !== undefined) userUpdates.first_name = first_name;
    if (last_name !== undefined) userUpdates.last_name = last_name;
    if (phone !== undefined) userUpdates.phone = phone;

    if (Object.keys(userUpdates).length > 0) {
      await existingUser.update(userUpdates, { transaction: t });
    }

    if (department !== undefined) {
      await existingUser.employeeProfile.update({ department }, { transaction: t });
    }
  });

  return getEmployeeById(employeeId);
};

module.exports = {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  updateEmployeeRole,
  updateEmployeeStatus,
};
