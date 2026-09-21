const { Position, Department, EmploymentRecord } = require("../models");

class PositionService {
  async getCompanyPositions(companyId) {
    return await Position.findAll({
      where: { company_id: companyId },
      include: [
        {
          model: Department,
          as: "department",
          attributes: ["id", "name"],
        },
      ],
      order: [["created_at", "DESC"]],
    });
  }

  async getDepartmentPositions(departmentId) {
    return await Position.findAll({
      where: { department_id: departmentId },
      order: [["title", "ASC"]],
    });
  }

  async createPosition(companyId, data) {
    if (data.department_id) {
      const department = await Department.findOne({
        where: { id: data.department_id, company_id: companyId },
      });
      if (!department) {
        const error = new Error("Invalid department or does not belong to this company");
      error.statusCode = 400;
      throw error;
      }
    }

    return await Position.create({
      ...data,
      company_id: companyId,
    });
  }

  async updatePosition(id, companyId, data) {
    const position = await Position.findOne({
      where: { id, company_id: companyId },
    });

    if (!position) {
      const error = new Error("Position not found or not owned by your company");
      error.statusCode = 404;
      throw error;
    }

    if (data.department_id) {
      const department = await Department.findOne({
        where: { id: data.department_id, company_id: companyId },
      });
      if (!department) {
        const error = new Error("Invalid department or does not belong to this company");
      error.statusCode = 400;
      throw error;
      }
    }

    return await position.update(data);
  }

  async deletePosition(id, companyId) {
    const position = await Position.findOne({
      where: { id, company_id: companyId },
    });

    if (!position) {
      const error = new Error("Position not found or not owned by your company");
      error.statusCode = 404;
      throw error;
    }

    const employeeCount = await EmploymentRecord.count({
      where: { position_id: id },
    });

    if (employeeCount > 0) {
      return await position.update({ is_active: false });
    }

    await position.destroy();
    return { deleted: true };
  }
}

module.exports = new PositionService();
