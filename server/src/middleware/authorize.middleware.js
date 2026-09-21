const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    const userRoles = req.user.Roles.map(
      (role) => role.name
    );

    const hasPermission = allowedRoles.some(
      (role) => userRoles.includes(role)
    );

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to perform this action",
      });
    }

    next();
  };
};

module.exports = authorize;