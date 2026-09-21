const authService = require("../services/auth.service");

const register = async (req, res) => {
  try {
    const user = await authService.register(req.body);

    res.status(201).json({
      success: true,
      message: "User registered successfully!",
      data: {
        user: {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          phone: user.phone,
          status: user.status,
        },
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const result = await authService.login(req.body);

    res.status(200).json({
      success: true,
      message: "Login successful!",
      data: {
        token: result.token,
        user: {
          id: result.user.id,
          first_name: result.user.first_name,
          last_name: result.user.last_name,
          email: result.user.email,
          phone: result.user.phone,
          status: result.user.status,
          roles: result.user.Roles ? result.user.Roles.map((r) => r.name) : [],
        },
      },
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};

const getMe = async (req, res) => {
  try {
    const user = req.user;

    res.status(200).json({
      success: true,
      message: "Current user retrieved successfully!",
      data: {
        user: {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          phone: user.phone,
          avatar_url: user.avatar_url,
          status: user.status,
          roles: user.Roles ? user.Roles.map(r => r.name) : [],
          department: user.employeeProfile?.department || null,
          created_at: user.created_at,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve current user",
    });
  }
};

module.exports = {
  register,
  login,
  getMe,
};