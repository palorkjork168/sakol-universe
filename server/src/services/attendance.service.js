const { Attendance, User } = require("../models");
const { Op } = require("sequelize");

const checkIn = async (userId, locationData) => {
  // Check if there's already an active check-in (check_out_time is null)
  const activeAttendance = await Attendance.findOne({
    where: {
      user_id: userId,
      check_out_time: null,
    },
  });

  if (activeAttendance) {
    const error = new Error("You are already checked in. Please check out first.");
    error.statusCode = 400;
    throw error;
  }

  try {
    const attendance = await Attendance.create({
      user_id: userId,
      check_in_time: new Date(),
      check_in_lat: locationData.latitude,
      check_in_long: locationData.longitude,
    });

    return attendance;
  } catch (err) {
    if (err.name === "SequelizeUniqueConstraintError") {
      const error = new Error("You are already checked in. Please check out first.");
      error.statusCode = 400;
      throw error;
    }
    throw err;
  }
};

const checkOut = async (userId, locationData) => {
  // Find the active check-in
  const activeAttendance = await Attendance.findOne({
    where: {
      user_id: userId,
      check_out_time: null,
    },
  });

  if (!activeAttendance) {
    const error = new Error("No active check-in found. Please check in first.");
    error.statusCode = 400;
    throw error;
  }

  activeAttendance.check_out_time = new Date();
  activeAttendance.check_out_lat = locationData.latitude;
  activeAttendance.check_out_long = locationData.longitude;
  
  await activeAttendance.save();

  return activeAttendance;
};

const getMyAttendance = async (userId) => {
  const attendances = await Attendance.findAll({
    where: {
      user_id: userId,
    },
    order: [["created_at", "DESC"]],
  });

  return attendances;
};

const getAllAttendance = async () => {
  const attendances = await Attendance.findAll({
    include: [
      {
        model: User,
        as: "user",
        attributes: ["id", "first_name", "last_name", "email"],
      },
    ],
    order: [["created_at", "DESC"]],
  });

  return attendances;
};

const getEmployeeAttendance = async (employeeId) => {
  const attendances = await Attendance.findAll({
    where: {
      user_id: employeeId,
    },
    include: [
      {
        model: User,
        as: "user",
        attributes: ["id", "first_name", "last_name", "email"],
      },
    ],
    order: [["created_at", "DESC"]],
  });

  return attendances;
};

module.exports = {
  checkIn,
  checkOut,
  getMyAttendance,
  getAllAttendance,
  getEmployeeAttendance,
};
