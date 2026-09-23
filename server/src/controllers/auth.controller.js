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
    const authorizationService = require("../services/authorization.service");
    const { CompanyUserRole, Company, Role } = require("../models");

    const permissions = await authorizationService.getUserGlobalPermissions(user);

    // Fetch company roles
    const assignedRoles = await CompanyUserRole.findAll({
      where: { user_id: user.id },
      include: [
        { model: Company, as: "company", attributes: ["id", "name"] },
        { model: Role, as: "role", attributes: ["id", "name"] },
      ],
    });

    const companyRoles = assignedRoles.map((ar) => ({
      id: ar.id,
      company_id: ar.company_id,
      company_name: ar.company ? ar.company.name : null,
      role: ar.role ? ar.role.name : null,
    }));

    // Also include owned companies as EMPLOYER / OWNER
    const ownedCompanies = await Company.findAll({
      where: { owner_id: user.id },
      attributes: ["id", "name"],
    });

    ownedCompanies.forEach((comp) => {
      if (!companyRoles.some((cr) => cr.company_id === comp.id && cr.role === "EMPLOYER")) {
        companyRoles.push({
          id: `owner-${comp.id}`,
          company_id: comp.id,
          company_name: comp.name,
          role: "EMPLOYER",
          is_owner: true,
        });
      }
    });

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
          roles: user.Roles ? user.Roles.map((r) => r.name) : [],
          permissions,
          companyRoles,
          department: user.employeeProfile?.department || null,
          created_at: user.created_at,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve current user: " + error.message,
    });
  }
};


module.exports = {
  register,
  login,
  getMe,
};