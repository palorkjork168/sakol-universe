const {
  User,
  Role,
  Company,
  Job,
  Application,
  Interview,
  EmploymentRecord,
  Attendance,
  Department,
  Position,
  LeaveType,
  LeaveRequest,
} = require("../models");
const sequelize = require("../config/database");
const { Op } = require("sequelize");
const leaveService = require("./leave.service");

/**
 * Standardize and sanitize date range query parameters.
 * Defaults to the last `defaultDays` (default: 30 days) ending at 23:59:59.999 UTC today.
 */
function parseDateRange(queryFrom, queryTo, defaultDays = 30) {
  let toDate = queryTo ? new Date(queryTo) : new Date();
  if (isNaN(toDate.getTime())) toDate = new Date();
  toDate.setUTCHours(23, 59, 59, 999);

  let fromDate;
  if (queryFrom) {
    fromDate = new Date(queryFrom);
    if (isNaN(fromDate.getTime())) {
      fromDate = new Date(toDate.getTime() - defaultDays * 24 * 60 * 60 * 1000);
      fromDate.setUTCHours(0, 0, 0, 0);
    } else {
      fromDate.setUTCHours(0, 0, 0, 0);
    }
  } else {
    fromDate = new Date(toDate.getTime() - defaultDays * 24 * 60 * 60 * 1000);
    fromDate.setUTCHours(0, 0, 0, 0);
  }

  if (fromDate > toDate) {
    fromDate = new Date(toDate.getTime() - defaultDays * 24 * 60 * 60 * 1000);
    fromDate.setUTCHours(0, 0, 0, 0);
  }

  return {
    fromDate,
    toDate,
    fromStr: fromDate.toISOString().split("T")[0],
    toStr: toDate.toISOString().split("T")[0],
  };
}

/**
 * Calculate leave days using the established Sakol Universe formula:
 * diffDays = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24)) + 1
 */
function calculateLeaveDays(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

class AnalyticsService {
  /**
   * ==========================================
   * 1. ADMIN PLATFORM-WIDE ANALYTICS
   * ==========================================
   */
  async getAdminPlatformOverview(queryFrom, queryTo) {
    const { fromDate, toDate, fromStr, toStr } = parseDateRange(queryFrom, queryTo, 30);
    const dateRangeFilter = { [Op.between]: [fromDate, toDate] };

    // Headline Totals (Promise.all for optimal query concurrency)
    const [
      totalUsers,
      newUsersInPeriod,
      totalCompanies,
      newCompaniesInPeriod,
      totalJobs,
      publishedJobs,
      newJobsInPeriod,
      totalApplications,
      applicationsInPeriod,
      totalInterviews,
      interviewsInPeriod,
      activeEmployees,
      totalLeaveRequests,
      pendingLeaveRequests,
    ] = await Promise.all([
      User.count(),
      User.count({ where: { created_at: dateRangeFilter } }),
      Company.count(),
      Company.count({ where: { created_at: dateRangeFilter } }),
      Job.count(),
      Job.count({ where: { status: "PUBLISHED" } }),
      Job.count({ where: { created_at: dateRangeFilter } }),
      Application.count(),
      Application.count({ where: { created_at: dateRangeFilter } }),
      Interview.count(),
      Interview.count({ where: { created_at: dateRangeFilter } }),
      EmploymentRecord.count({ where: { status: "ACTIVE" }, distinct: true, col: "user_id" }),
      LeaveRequest.count(),
      LeaveRequest.count({ where: { status: "PENDING" } }),
    ]);

    // System Distributions
    // 1. Users by Role
    const usersByRoleRaw = await sequelize.query(
      `SELECT r.name as role_name, COUNT(ur.user_id)::int as count
       FROM roles r
       LEFT JOIN user_roles ur ON r.id = ur.role_id
       GROUP BY r.id, r.name
       ORDER BY count DESC`,
      { type: sequelize.QueryTypes.SELECT }
    );

    // 2. Jobs by Status
    const jobsByStatusRaw = await Job.findAll({
      attributes: ["status", [sequelize.fn("COUNT", sequelize.col("id")), "count"]],
      group: ["status"],
      raw: true,
    });

    // 3. Applications by Status
    const applicationsByStatusRaw = await Application.findAll({
      attributes: ["status", [sequelize.fn("COUNT", sequelize.col("id")), "count"]],
      group: ["status"],
      raw: true,
    });

    // 4. Leave Requests by Status
    const leaveByStatusRaw = await LeaveRequest.findAll({
      attributes: ["status", [sequelize.fn("COUNT", sequelize.col("id")), "count"]],
      group: ["status"],
      raw: true,
    });

    // Time-Series Trends within Range (daily grouping)
    const [userTrendRaw, appTrendRaw, jobTrendRaw] = await Promise.all([
      sequelize.query(
        `SELECT to_char(date_trunc('day', created_at), 'YYYY-MM-DD') as date, COUNT(*)::int as count
         FROM users
         WHERE created_at BETWEEN :fromDate AND :toDate
         GROUP BY date_trunc('day', created_at)
         ORDER BY date ASC`,
        {
          replacements: { fromDate, toDate },
          type: sequelize.QueryTypes.SELECT,
        }
      ),
      sequelize.query(
        `SELECT to_char(date_trunc('day', created_at), 'YYYY-MM-DD') as date, COUNT(*)::int as count
         FROM applications
         WHERE created_at BETWEEN :fromDate AND :toDate
         GROUP BY date_trunc('day', created_at)
         ORDER BY date ASC`,
        {
          replacements: { fromDate, toDate },
          type: sequelize.QueryTypes.SELECT,
        }
      ),
      sequelize.query(
        `SELECT to_char(date_trunc('day', created_at), 'YYYY-MM-DD') as date, COUNT(*)::int as count
         FROM jobs
         WHERE created_at BETWEEN :fromDate AND :toDate
         GROUP BY date_trunc('day', created_at)
         ORDER BY date ASC`,
        {
          replacements: { fromDate, toDate },
          type: sequelize.QueryTypes.SELECT,
        }
      ),
    ]);

    return {
      range: {
        from: fromStr,
        to: toStr,
      },
      overview: {
        totalUsers,
        newUsersInPeriod,
        totalCompanies,
        newCompaniesInPeriod,
        totalJobs,
        publishedJobs,
        newJobsInPeriod,
        totalApplications,
        applicationsInPeriod,
        totalInterviews,
        interviewsInPeriod,
        activeEmployees,
        totalLeaveRequests,
        pendingLeaveRequests,
      },
      distributions: {
        usersByRole: usersByRoleRaw.map((r) => ({ role: r.role_name, count: Number(r.count) })),
        jobsByStatus: jobsByStatusRaw.map((j) => ({ status: j.status, count: Number(j.count) })),
        applicationsByStatus: applicationsByStatusRaw.map((a) => ({ status: a.status, count: Number(a.count) })),
        leaveByStatus: leaveByStatusRaw.map((l) => ({ status: l.status, count: Number(l.count) })),
      },
      trends: {
        userRegistrations: userTrendRaw,
        applicationsSubmitted: appTrendRaw,
        jobsCreated: jobTrendRaw,
      },
    };
  }

  /**
   * ==========================================
   * 2. EMPLOYER COMPANY ANALYTICS
   * ==========================================
   */
  async getCompanyOverview(companyId, queryFrom, queryTo) {
    const company = await Company.findByPk(companyId);
    if (!company) {
      const err = new Error("Company not found");
      err.statusCode = 404;
      throw err;
    }

    const { fromDate, toDate, fromStr, toStr } = parseDateRange(queryFrom, queryTo, 30);
    const dateRangeFilter = { [Op.between]: [fromDate, toDate] };

    // 1. Company Overview Counts
    const [
      headcount,
      departmentsCount,
      positionsCount,
      jobsTotal,
      jobsPublished,
      pendingLeaveRequests,
    ] = await Promise.all([
      EmploymentRecord.count({
        where: { company_id: companyId, status: "ACTIVE" },
        distinct: true,
        col: "user_id",
      }),
      Department.count({ where: { company_id: companyId } }),
      Position.count({ where: { company_id: companyId } }),
      Job.count({ where: { company_id: companyId } }),
      Job.count({ where: { company_id: companyId, status: "PUBLISHED" } }),
      LeaveRequest.count({ where: { company_id: companyId, status: "PENDING" } }),
    ]);

    // Fetch all jobs for company
    const companyJobs = await Job.findAll({
      where: { company_id: companyId },
      attributes: ["id", "title", "status", "created_at"],
    });
    const jobIds = companyJobs.map((j) => j.id);

    // 2. Recruitment Funnel and Job Application Aggregates
    let funnel = {
      applications: 0,
      reviewing: 0,
      interview: 0,
      accepted: 0,
      hired: 0,
      conversionRates: {
        applicationToReviewRate: null,
        reviewToInterviewRate: null,
        interviewToAcceptedRate: null,
        acceptedToHireRate: null,
        overallConversionRate: null,
      },
    };

    let jobsPerformance = [];
    let interviewsTotal = 0;
    let applicationsTotal = 0;
    let hiresTotal = 0;

    if (jobIds.length > 0) {
      // Find applications submitted within date range for company jobs
      const applications = await Application.findAll({
        where: {
          job_id: { [Op.in]: jobIds },
          created_at: dateRangeFilter,
        },
        attributes: ["id", "job_id", "user_id", "status", "created_at"],
        include: [
          {
            model: Interview,
            as: "interviews",
            attributes: ["id", "status"],
            required: false,
          },
        ],
      });

      applicationsTotal = applications.length;

      // Also get all distinct users who have an active employment record in this company
      const companyEmployees = await EmploymentRecord.findAll({
        where: { company_id: companyId },
        attributes: ["user_id"],
        raw: true,
      });
      const employeeUserIdsSet = new Set(companyEmployees.map((e) => e.user_id));

      let reviewingCount = 0;
      let interviewCount = 0;
      let acceptedCount = 0;
      let hiredCount = 0;

      // Group by job for table breakdown
      const jobStatsMap = {};
      companyJobs.forEach((j) => {
        jobStatsMap[j.id] = {
          id: j.id,
          title: j.title,
          status: j.status,
          applicationCount: 0,
          interviewCount: 0,
          acceptedCount: 0,
          hireCount: 0,
        };
      });

      applications.forEach((app) => {
        const hasInterview = (app.interviews && app.interviews.length > 0) || app.status === "INTERVIEW";
        const isReviewingOrBeyond = ["REVIEWING", "INTERVIEW", "ACCEPTED"].includes(app.status);
        const isAccepted = app.status === "ACCEPTED";
        const isHired = isAccepted && employeeUserIdsSet.has(app.user_id);

        if (isReviewingOrBeyond) reviewingCount++;
        if (hasInterview) interviewCount++;
        if (isAccepted) acceptedCount++;
        if (isHired) hiredCount++;

        if (jobStatsMap[app.job_id]) {
          jobStatsMap[app.job_id].applicationCount++;
          if (hasInterview) jobStatsMap[app.job_id].interviewCount++;
          if (isAccepted) jobStatsMap[app.job_id].acceptedCount++;
          if (isHired) jobStatsMap[app.job_id].hireCount++;
        }
      });

      interviewsTotal = applications.reduce(
        (sum, app) => sum + (app.interviews ? app.interviews.length : 0),
        0
      );
      hiresTotal = hiredCount;

      // Conversion rates (only calculate when denominator > 0)
      const calcRate = (numerator, denominator) =>
        denominator > 0 ? Number(((numerator / denominator) * 100).toFixed(1)) : null;

      funnel = {
        applications: applicationsTotal,
        reviewing: reviewingCount,
        interview: interviewCount,
        accepted: acceptedCount,
        hired: hiredCount,
        conversionRates: {
          applicationToReviewRate: calcRate(reviewingCount, applicationsTotal),
          reviewToInterviewRate: calcRate(interviewCount, reviewingCount),
          interviewToAcceptedRate: calcRate(acceptedCount, interviewCount),
          acceptedToHireRate: calcRate(hiredCount, acceptedCount),
          overallConversionRate: calcRate(hiredCount, applicationsTotal),
        },
      };

      jobsPerformance = Object.values(jobStatsMap).sort(
        (a, b) => b.applicationCount - a.applicationCount
      );
    }

    // 3. Workforce Distribution (Headcount by Department & Position)
    const employeesByDeptRaw = await sequelize.query(
      `SELECT COALESCE(d.name, 'Unassigned') as department_name, COUNT(er.user_id)::int as count
       FROM employment_records er
       LEFT JOIN departments d ON er.department_id = d.id
       WHERE er.company_id = :companyId AND er.status = 'ACTIVE'
       GROUP BY d.name
       ORDER BY count DESC`,
      {
        replacements: { companyId },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    const employeesByPosRaw = await sequelize.query(
      `SELECT COALESCE(p.title, 'Unassigned') as position_title, COUNT(er.user_id)::int as count
       FROM employment_records er
       LEFT JOIN positions p ON er.position_id = p.id
       WHERE er.company_id = :companyId AND er.status = 'ACTIVE'
       GROUP BY p.title
       ORDER BY count DESC`,
      {
        replacements: { companyId },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    const newHiresInPeriod = await EmploymentRecord.count({
      where: {
        company_id: companyId,
        status: "ACTIVE",
        start_date: dateRangeFilter,
      },
    });

    // 4. Leave Analytics
    const leaveRequestsInPeriod = await LeaveRequest.findAll({
      where: {
        company_id: companyId,
        created_at: dateRangeFilter,
      },
      include: [
        {
          model: LeaveType,
          as: "leaveType",
          attributes: ["id", "name"],
        },
      ],
    });

    const leaveStatusCounts = {
      total: leaveRequestsInPeriod.length,
      pending: 0,
      approved: 0,
      rejected: 0,
      cancelled: 0,
    };

    let approvedLeaveDays = 0;
    const leaveTypeBreakdownMap = {};

    leaveRequestsInPeriod.forEach((req) => {
      const st = (req.status || "").toLowerCase();
      if (leaveStatusCounts[st] !== undefined) {
        leaveStatusCounts[st]++;
      }

      const typeName = req.leaveType?.name || "Unspecified";
      if (!leaveTypeBreakdownMap[typeName]) {
        leaveTypeBreakdownMap[typeName] = { name: typeName, count: 0, approvedDays: 0 };
      }
      leaveTypeBreakdownMap[typeName].count++;

      if (req.status === "APPROVED") {
        const days = calculateLeaveDays(req.start_date, req.end_date);
        approvedLeaveDays += days;
        leaveTypeBreakdownMap[typeName].approvedDays += days;
      }
    });

    // 5. Attendance Analytics
    // Fetch user IDs of active company employees to isolate attendance
    const companyActiveEmployees = await EmploymentRecord.findAll({
      where: { company_id: companyId, status: "ACTIVE" },
      attributes: ["user_id"],
      raw: true,
    });
    const companyUserIds = companyActiveEmployees.map((e) => e.user_id);

    let attendanceMetrics = {
      checkedInToday: 0,
      activeSessionsNow: 0,
      completedSessions: 0,
      totalHoursCompleted: 0,
      avgSessionDurationHours: null,
      sessionsOverTime: [],
      unsupportedMetricsNotice:
        "Lateness rate, absence rate, and productivity scores are not calculated because work shift schedules and expected hours are not modeled in the current schema.",
    };

    if (companyUserIds.length > 0) {
      const todayStart = new Date();
      todayStart.setUTCHours(0, 0, 0, 0);

      // Checked in today count
      const checkedInToday = await Attendance.count({
        where: {
          user_id: { [Op.in]: companyUserIds },
          check_in_time: { [Op.gte]: todayStart },
        },
        distinct: true,
        col: "user_id",
      });

      // Currently open sessions
      const activeSessionsNow = await Attendance.count({
        where: {
          user_id: { [Op.in]: companyUserIds },
          check_out_time: null,
        },
      });

      // Completed sessions in date range
      const completedAttendances = await Attendance.findAll({
        where: {
          user_id: { [Op.in]: companyUserIds },
          check_out_time: { [Op.ne]: null },
          check_in_time: dateRangeFilter,
        },
        attributes: ["check_in_time", "check_out_time"],
      });

      let totalMilliseconds = 0;
      completedAttendances.forEach((att) => {
        const inTime = new Date(att.check_in_time).getTime();
        const outTime = new Date(att.check_out_time).getTime();
        if (outTime > inTime) {
          totalMilliseconds += outTime - inTime;
        }
      });

      const totalHoursCompleted = Number((totalMilliseconds / (1000 * 60 * 60)).toFixed(1));
      const completedSessionsCount = completedAttendances.length;
      const avgDuration =
        completedSessionsCount > 0
          ? Number((totalHoursCompleted / completedSessionsCount).toFixed(1))
          : null;

      // Attendance sessions over time (grouped by day)
      const sessionsOverTimeRaw = await sequelize.query(
        `SELECT to_char(date_trunc('day', check_in_time), 'YYYY-MM-DD') as date, COUNT(*)::int as count
         FROM attendances
         WHERE user_id IN (:companyUserIds) AND check_in_time BETWEEN :fromDate AND :toDate
         GROUP BY date_trunc('day', check_in_time)
         ORDER BY date ASC`,
        {
          replacements: { companyUserIds, fromDate, toDate },
          type: sequelize.QueryTypes.SELECT,
        }
      );

      attendanceMetrics = {
        checkedInToday,
        activeSessionsNow,
        completedSessions: completedSessionsCount,
        totalHoursCompleted,
        avgSessionDurationHours: avgDuration,
        sessionsOverTime: sessionsOverTimeRaw,
        unsupportedMetricsNotice:
          "Lateness rate, absence rate, and productivity scores are not calculated because work shift schedules and expected hours are not modeled in the current schema.",
      };
    }

    return {
      company: {
        id: company.id,
        name: company.name,
      },
      range: {
        from: fromStr,
        to: toStr,
      },
      overview: {
        headcount,
        departments: departmentsCount,
        positions: positionsCount,
        jobsTotal,
        jobsPublished,
        applicationsTotal,
        interviewsTotal,
        hiresTotal,
        pendingLeaveRequests,
        newHiresInPeriod,
      },
      funnel,
      topJobs: jobsPerformance.slice(0, 10),
      workforce: {
        headcount,
        byDepartment: employeesByDeptRaw.map((d) => ({
          name: d.department_name,
          count: Number(d.count),
        })),
        byPosition: employeesByPosRaw.map((p) => ({
          title: p.position_title,
          count: Number(p.count),
        })),
      },
      leave: {
        summary: leaveStatusCounts,
        approvedLeaveDays,
        byType: Object.values(leaveTypeBreakdownMap),
      },
      attendance: attendanceMetrics,
    };
  }

  /**
   * ==========================================
   * 3. EMPLOYEE PERSONAL SUMMARY
   * ==========================================
   */
  async getEmployeePersonalAnalytics(userId) {
    const user = await User.findByPk(userId);
    if (!user) {
      const err = new Error("User not found");
      err.statusCode = 404;
      throw err;
    }

    // Active employment record for context
    const employment = await EmploymentRecord.findOne({
      where: { user_id: userId, status: "ACTIVE" },
      include: [
        { model: Company, as: "company", attributes: ["id", "name"] },
        { model: Department, as: "department", attributes: ["id", "name"] },
        { model: Position, as: "position", attributes: ["id", "title"] },
      ],
    });

    const now = new Date();
    const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0));
    const startOfYear = new Date(Date.UTC(now.getUTCFullYear(), 0, 1, 0, 0, 0));

    // 1. Attendance Summary
    const thisMonthAttendances = await Attendance.findAll({
      where: {
        user_id: userId,
        check_in_time: { [Op.gte]: startOfMonth },
      },
      attributes: ["id", "check_in_time", "check_out_time"],
      order: [["check_in_time", "DESC"]],
    });

    const activeSession = await Attendance.findOne({
      where: {
        user_id: userId,
        check_out_time: null,
      },
      attributes: ["id", "check_in_time"],
    });

    let completedHoursThisMonth = 0;
    let completedSessionsCount = 0;

    thisMonthAttendances.forEach((att) => {
      if (att.check_out_time) {
        const inTime = new Date(att.check_in_time).getTime();
        const outTime = new Date(att.check_out_time).getTime();
        if (outTime > inTime) {
          completedHoursThisMonth += (outTime - inTime) / (1000 * 60 * 60);
          completedSessionsCount++;
        }
      }
    });

    // 2. Leave Summary
    const [pendingRequests, approvedThisYear, upcomingApprovedLeave, balances] = await Promise.all([
      LeaveRequest.count({
        where: { user_id: userId, status: "PENDING" },
      }),
      LeaveRequest.findAll({
        where: {
          user_id: userId,
          status: "APPROVED",
          start_date: { [Op.gte]: startOfYear },
        },
      }),
      LeaveRequest.findAll({
        where: {
          user_id: userId,
          status: "APPROVED",
          start_date: { [Op.gte]: now.toISOString().split("T")[0] },
        },
        include: [{ model: LeaveType, as: "leaveType", attributes: ["name"] }],
        order: [["start_date", "ASC"]],
        limit: 5,
      }),
      leaveService.getMyLeaveBalance(userId).catch(() => []),
    ]);

    let approvedDaysThisYear = 0;
    approvedThisYear.forEach((req) => {
      approvedDaysThisYear += calculateLeaveDays(req.start_date, req.end_date);
    });

    return {
      employment: employment
        ? {
            companyName: employment.company?.name || null,
            departmentName: employment.department?.name || null,
            positionTitle: employment.position?.title || null,
            startDate: employment.start_date,
          }
        : null,
      attendance: {
        thisMonthSessions: thisMonthAttendances.length,
        completedSessionsThisMonth: completedSessionsCount,
        completedHoursThisMonth: Number(completedHoursThisMonth.toFixed(1)),
        isCurrentlyCheckedIn: Boolean(activeSession),
        activeSessionCheckInTime: activeSession ? activeSession.check_in_time : null,
      },
      leave: {
        pendingRequests,
        approvedRequestsThisYear: approvedThisYear.length,
        approvedDaysThisYear,
        upcomingApprovedLeave: upcomingApprovedLeave.map((l) => ({
          id: l.id,
          leaveType: l.leaveType?.name || "Leave",
          startDate: l.start_date,
          endDate: l.end_date,
          days: calculateLeaveDays(l.start_date, l.end_date),
        })),
        balances,
      },
    };
  }
}

module.exports = new AnalyticsService();
