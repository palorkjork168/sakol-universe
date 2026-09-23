const authorizationService = require("../services/authorization.service");

/**
 * Middleware to require a global permission (with ADMIN bypass)
 */
const requirePermission = (permissionName) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      if (authorizationService.isAdmin(req.user)) {
        return next();
      }

      const globalPerms = await authorizationService.getUserGlobalPermissions(req.user);
      if (!globalPerms.includes(permissionName)) {
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

/**
 * Middleware to require permission within a company context
 * @param {string} permissionName
 * @param {Function} [companyIdResolver] - Function (req) => companyId. Defaults to resolving from params, body, or query.
 */
const requireCompanyPermission = (permissionName, companyIdResolver) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      if (authorizationService.isAdmin(req.user)) {
        return next();
      }

      let companyId;
      if (typeof companyIdResolver === "function") {
        companyId = companyIdResolver(req);
      } else {
        companyId = req.params.companyId || req.body.companyId || req.query.companyId;
      }

      if (companyId) {
        const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!UUID_REGEX.test(companyId)) {
          return res.status(400).json({
            success: false,
            message: "Invalid company ID format",
          });
        }
      }

      const hasPerm = await authorizationService.hasCompanyPermission(req.user, companyId, permissionName);
      if (!hasPerm) {
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

module.exports = {
  requirePermission,
  requireCompanyPermission,
};
