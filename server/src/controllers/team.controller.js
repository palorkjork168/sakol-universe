const { User, Company, EmploymentRecord, Department, Position, CompanyUserRole, Role } = require("../models");
const authorizationService = require("../services/authorization.service");

/**
 * Get company team members with department, position, and company roles
 */
const getCompanyTeam = async (req, res, next) => {
  try {
    const { companyId } = req.params;

    // Verify company exists
    const company = await Company.findByPk(companyId);
    if (!company) {
      return res.status(404).json({ success: false, message: "Company not found" });
    }

    // Security check: Must be owner, admin, or have employees.view in this company
    const hasPerm = await authorizationService.hasCompanyPermission(req.user, companyId, "employees.view");
    if (!hasPerm) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to view this company's team",
      });
    }

    // Fetch employment records for this company
    const records = await EmploymentRecord.findAll({
      where: { company_id: companyId },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "first_name", "last_name", "email", "phone", "avatar_url", "status"],
        },
        {
          model: Department,
          as: "department",
          attributes: ["id", "name"],
        },
        {
          model: Position,
          as: "position",
          attributes: ["id", "title"],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    // Fetch all CompanyUserRole assignments for this company
    const companyRoles = await CompanyUserRole.findAll({
      where: { company_id: companyId },
      include: [
        {
          model: Role,
          as: "role",
          attributes: ["id", "name", "description"],
        },
      ],
    });

    // Map company roles by user_id
    const rolesByUser = {};
    companyRoles.forEach((cr) => {
      if (!rolesByUser[cr.user_id]) rolesByUser[cr.user_id] = [];
      rolesByUser[cr.user_id].push({
        id: cr.id,
        role_id: cr.role_id,
        role_name: cr.role ? cr.role.name : null,
        description: cr.role ? cr.role.description : null,
      });
    });

    const team = records.map((rec) => {
      const isOwner = company.owner_id === rec.user_id;
      return {
        id: rec.id,
        user_id: rec.user_id,
        company_id: rec.company_id,
        user: rec.user,
        department: rec.department,
        position: rec.position,
        employment_type: rec.employment_type,
        start_date: rec.start_date,
        status: rec.status,
        is_owner: isOwner,
        company_roles: rolesByUser[rec.user_id] || [],
      };
    });

    res.status(200).json({
      success: true,
      data: {
        company: {
          id: company.id,
          name: company.name,
          owner_id: company.owner_id,
        },
        team,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Assign a company role (HR, MANAGER, RECRUITER) to a user in this company
 */
const assignCompanyRole = async (req, res, next) => {
  try {
    const { companyId } = req.params;
    const { user_id, role_name } = req.body;

    if (!user_id || !role_name) {
      return res.status(400).json({
        success: false,
        message: "user_id and role_name are required",
      });
    }

    // Security: Only owner or admin (or users with employees.manage in this company) can assign roles
    const hasManagePerm = await authorizationService.hasCompanyPermission(req.user, companyId, "employees.manage");
    if (!hasManagePerm) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to assign roles in this company",
      });
    }

    // Core security rule: cannot assign ADMIN or global-only roles
    const allowedCompanyRoles = ["HR", "MANAGER", "RECRUITER"];
    if (!allowedCompanyRoles.includes(role_name.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: `Invalid company role. Allowed company roles are: ${allowedCompanyRoles.join(", ")}`,
      });
    }

    // Verify company exists
    const company = await Company.findByPk(companyId);
    if (!company) {
      return res.status(404).json({ success: false, message: "Company not found" });
    }

    // Verify target user exists and has employment or is part of company
    const targetUser = await User.findByPk(user_id);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: "Target user not found" });
    }

    // Verify role exists
    const role = await Role.findOne({ where: { name: role_name.toUpperCase() } });
    if (!role) {
      return res.status(404).json({ success: false, message: `Role ${role_name} not found in system` });
    }

    // Assign company role idempotently
    const [assignment, created] = await CompanyUserRole.findOrCreate({
      where: {
        user_id,
        company_id: companyId,
        role_id: role.id,
      },
      defaults: {
        user_id,
        company_id: companyId,
        role_id: role.id,
        created_by: req.user.id,
      },
    });

    res.status(200).json({
      success: true,
      message: created
        ? `Role ${role.name} assigned successfully`
        : `User already has role ${role.name} in this company`,
      data: { assignment },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Remove a company role assignment
 */
const removeCompanyRole = async (req, res, next) => {
  try {
    const { companyId, assignmentId } = req.params;

    // Security: Only owner or admin (or users with employees.manage in this company) can remove roles
    const hasManagePerm = await authorizationService.hasCompanyPermission(req.user, companyId, "employees.manage");
    if (!hasManagePerm) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to revoke roles in this company",
      });
    }

    const assignment = await CompanyUserRole.findOne({
      where: {
        id: assignmentId,
        company_id: companyId,
      },
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Company role assignment not found",
      });
    }

    await assignment.destroy();

    res.status(200).json({
      success: true,
      message: "Company role assignment removed successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCompanyTeam,
  assignCompanyRole,
  removeCompanyRole,
};
