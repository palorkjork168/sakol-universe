const { User, Company, Job, Application, EmploymentRecord, LeaveRequest } = require("../models");

exports.getDashboardStats = async (req, res, next) => {
  try {
    const userCount = await User.count();
    const companyCount = await Company.count();
    const jobCount = await Job.count({ where: { status: "PUBLISHED" } });
    const applicationCount = await Application.count();
    const employeeCount = await EmploymentRecord.count({
      where: { status: "ACTIVE" },
      distinct: true,
      col: "user_id",
    });
    const pendingLeaveCount = await LeaveRequest.count({ where: { status: "PENDING" } });

    res.json({
      success: true,
      data: {
        users: userCount,
        companies: companyCount,
        active_jobs: jobCount,
        applications: applicationCount,
        employees: employeeCount,
        pending_leaves: pendingLeaveCount,
      }
    });
  } catch (error) {
    next(error);
  }
};
