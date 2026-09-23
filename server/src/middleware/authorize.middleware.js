const { CompanyUserRole, Role } = require("../models");

const authorize = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Authentication token is required",
        });
      }

      const userRoles = (req.user.Roles || []).map((role) => role.name);

      // 1. Direct global role check
      let hasRole = allowedRoles.some((role) => userRoles.includes(role));

      // 2. If not matched globally, check company-scoped role assignments
      if (!hasRole && req.user.id) {
        const companyRoles = await CompanyUserRole.findAll({
          where: { user_id: req.user.id },
          include: [{ model: Role, as: "role", attributes: ["name"] }],
        });

        hasRole = companyRoles.some(
          (cr) => cr.role && allowedRoles.includes(cr.role.name)
        );
      }

      if (!hasRole) {
        return res.status(403).json({
          success: false,
          message: "You do not have permission to perform this action",
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = authorize;