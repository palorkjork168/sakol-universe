const { Department, Company, EmployeeProfile, EmploymentRecord } = require("../models");

class DepartmentService {
  async getCompanyDepartments(companyId, userId) {
    // Optional: check if user is admin or belongs to the company, or if they are the owner
    // For now, assuming middleware handles the basic security.
    return await Department.findAll({
      where: { company_id: companyId },
      order: [["created_at", "DESC"]],
    });
  }

  async createDepartment(companyId, data) {
    // The controller should have already verified ownership
    return await Department.create({
      ...data,
      company_id: companyId,
    });
  }

  async updateDepartment(id, companyId, data) {
    const department = await Department.findOne({
      where: { id, company_id: companyId },
    });

    if (!department) {
      const error = new Error("Department not found or not owned by your company");
      error.statusCode = 404;
      throw error;
    }

    return await department.update(data);
  }

  async deleteDepartment(id, companyId) {
    const department = await Department.findOne({
      where: { id, company_id: companyId },
    });

    if (!department) {
      const error = new Error("Department not found or not owned by your company");
      error.statusCode = 404;
      throw error;
    }

    // Check if it's in use
    const employeeCount = await EmploymentRecord.count({
      where: { department_id: id },
    });

    if (employeeCount > 0) {
      // Soft deactivate instead of destructive delete if in use
      return await department.update({ is_active: false });
    }

    await department.destroy();
    return { deleted: true };
  }
}

module.exports = new DepartmentService();
