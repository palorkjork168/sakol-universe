const { LeaveType, LeaveRequest, EmploymentRecord, Company, User, sequelize } = require("../models");
const { Op } = require("sequelize");

class LeaveService {
  // Leave Types
  async getLeaveTypes(companyId, includeInactive = false) {
    const whereClause = { company_id: companyId };
    if (!includeInactive) {
      whereClause.is_active = true;
    }
    return await LeaveType.findAll({
      where: whereClause,
      order: [["name", "ASC"]],
    });
  }

  async createLeaveType(companyId, data) {
    return await LeaveType.create({
      ...data,
      company_id: companyId,
    });
  }

  async updateLeaveType(id, companyId, data) {
    const leaveType = await LeaveType.findOne({
      where: { id, company_id: companyId },
    });

    if (!leaveType) {
      const error = new Error("Leave type not found");
      error.statusCode = 404;
      throw error;
    }

    return await leaveType.update(data);
  }

  async deleteLeaveType(id, companyId) {
    const leaveType = await LeaveType.findOne({
      where: { id, company_id: companyId },
    });

    if (!leaveType) {
      const error = new Error("Leave type not found");
      error.statusCode = 404;
      throw error;
    }

    const requestCount = await LeaveRequest.count({
      where: { leave_type_id: id },
    });

    if (requestCount > 0) {
      return await leaveType.update({ is_active: false });
    }

    await leaveType.destroy();
    return { deleted: true };
  }

  // Leave Requests - Employee
  async getMyLeaveRequests(userId) {
    return await LeaveRequest.findAll({
      where: { user_id: userId },
      include: [
        {
          model: LeaveType,
          as: "leaveType",
          attributes: ["name", "is_paid"],
        },
      ],
      order: [["created_at", "DESC"]],
    });
  }

  async getMyLeaveBalance(userId) {
    // Determine user's active company
    const employment = await EmploymentRecord.findOne({
      where: { user_id: userId, status: "ACTIVE" },
    });

    if (!employment) {
      const error = new Error("Active employment record not found");
      error.statusCode = 404;
      throw error;
    }

    const leaveTypes = await LeaveType.findAll({
      where: { company_id: employment.company_id, is_active: true },
    });

    const approvedRequests = await LeaveRequest.findAll({
      where: {
        user_id: userId,
        company_id: employment.company_id,
        status: "APPROVED",
      },
    });

    const balances = leaveTypes.map((type) => {
      const typeRequests = approvedRequests.filter(
        (r) => r.leave_type_id === type.id
      );
      
      let usedDays = 0;
      typeRequests.forEach(req => {
        const start = new Date(req.start_date);
        const end = new Date(req.end_date);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; 
        usedDays += diffDays;
      });

      return {
        leave_type_id: type.id,
        name: type.name,
        default_days: type.default_days,
        used_days: usedDays,
        remaining_days: type.default_days !== null ? type.default_days - usedDays : null,
      };
    });

    return balances;
  }

  async createLeaveRequest(userId, data) {
    const employment = await EmploymentRecord.findOne({
      where: { user_id: userId, status: "ACTIVE" },
    });

    if (!employment) {
      const error = new Error("You do not have an active employment record");
      error.statusCode = 403;
      throw error;
    }

    const leaveType = await LeaveType.findOne({
      where: { id: data.leave_type_id, company_id: employment.company_id },
    });

    if (!leaveType) {
      const error = new Error("Invalid leave type for your company");
      error.statusCode = 400;
      throw error;
    }

    // Check overlaps
    const overlaps = await LeaveRequest.count({
      where: {
        user_id: userId,
        status: { [Op.in]: ["PENDING", "APPROVED"] },
        start_date: { [Op.lte]: data.end_date },
        end_date: { [Op.gte]: data.start_date },
      },
    });

    if (overlaps > 0) {
      const error = new Error("Leave request overlaps with an existing pending or approved request");
      error.statusCode = 409;
      throw error;
    }

    return await LeaveRequest.create({
      ...data,
      user_id: userId,
      company_id: employment.company_id,
    });
  }

  async cancelLeaveRequest(requestId, userId) {
    const request = await LeaveRequest.findOne({
      where: { id: requestId, user_id: userId },
    });

    if (!request) {
      const error = new Error("Leave request not found");
      error.statusCode = 404;
      throw error;
    }

    if (request.status !== "PENDING") {
      const error = new Error("Only pending requests can be cancelled");
      error.statusCode = 400;
      throw error;
    }

    return await request.update({ status: "CANCELLED" });
  }

  // Leave Requests - Employer
  async getCompanyLeaveRequests(companyId) {
    return await LeaveRequest.findAll({
      where: { company_id: companyId },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "first_name", "last_name", "email", "avatar_url"],
        },
        {
          model: LeaveType,
          as: "leaveType",
          attributes: ["name"],
        },
      ],
      order: [["created_at", "DESC"]],
    });
  }

  async reviewLeaveRequest(requestId, companyId, reviewerId, status, reviewNote) {
    const transaction = await sequelize.transaction();

    try {
      const request = await LeaveRequest.findOne({
        where: { id: requestId, company_id: companyId },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!request) {
        const error = new Error("Leave request not found");
      error.statusCode = 404;
      throw error;
      }

      if (request.status !== "PENDING") {
        const error = new Error(`Request is already ${request.status}`);
      error.statusCode = 400;
      throw error;
      }

      if (status !== "APPROVED" && status !== "REJECTED") {
        const error = new Error("Invalid review status");
      error.statusCode = 400;
      throw error;
      }

      await request.update(
        {
          status,
          reviewed_by: reviewerId,
          reviewed_at: new Date(),
          review_note: reviewNote,
        },
        { transaction }
      );

      await transaction.commit();
      return request;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}

module.exports = new LeaveService();
