export interface DateRange {
  from: string;
  to: string;
}

export interface AdminOverviewData {
  range: DateRange;
  overview: {
    totalUsers: number;
    newUsersInPeriod: number;
    totalCompanies: number;
    newCompaniesInPeriod: number;
    totalJobs: number;
    publishedJobs: number;
    newJobsInPeriod: number;
    totalApplications: number;
    applicationsInPeriod: number;
    totalInterviews: number;
    interviewsInPeriod: number;
    activeEmployees: number;
    totalLeaveRequests: number;
    pendingLeaveRequests: number;
  };
  distributions: {
    usersByRole: { role: string; count: number }[];
    jobsByStatus: { status: string; count: number }[];
    applicationsByStatus: { status: string; count: number }[];
    leaveByStatus: { status: string; count: number }[];
  };
  trends: {
    userRegistrations: { date: string; count: number }[];
    applicationsSubmitted: { date: string; count: number }[];
    jobsCreated: { date: string; count: number }[];
  };
}

export interface CompanyAnalyticsData {
  company: {
    id: string;
    name: string;
  };
  range: DateRange;
  overview: {
    headcount: number;
    departments: number;
    positions: number;
    jobsTotal: number;
    jobsPublished: number;
    applicationsTotal: number;
    interviewsTotal: number;
    hiresTotal: number;
    pendingLeaveRequests: number;
    newHiresInPeriod: number;
  };
  funnel: {
    applications: number;
    reviewing: number;
    interview: number;
    accepted: number;
    hired: number;
    conversionRates: {
      applicationToReviewRate: number | null;
      reviewToInterviewRate: number | null;
      interviewToAcceptedRate: number | null;
      acceptedToHireRate: number | null;
      overallConversionRate: number | null;
    };
  };
  topJobs: {
    id: string;
    title: string;
    status: string;
    applicationCount: number;
    interviewCount: number;
    acceptedCount: number;
    hireCount: number;
  }[];
  workforce: {
    headcount: number;
    byDepartment: { name: string; count: number }[];
    byPosition: { title: string; count: number }[];
  };
  leave: {
    summary: {
      total: number;
      pending: number;
      approved: number;
      rejected: number;
      cancelled: number;
    };
    approvedLeaveDays: number;
    byType: {
      name: string;
      count: number;
      approvedDays: number;
    }[];
  };
  attendance: {
    checkedInToday: number;
    activeSessionsNow: number;
    completedSessions: number;
    totalHoursCompleted: number;
    avgSessionDurationHours: number | null;
    sessionsOverTime: { date: string; count: number }[];
    unsupportedMetricsNotice: string;
  };
}

export interface EmployeePersonalAnalyticsData {
  employment: {
    companyName: string | null;
    departmentName: string | null;
    positionTitle: string | null;
    startDate: string | null;
  } | null;
  attendance: {
    thisMonthSessions: number;
    completedSessionsThisMonth: number;
    completedHoursThisMonth: number;
    isCurrentlyCheckedIn: boolean;
    activeSessionCheckInTime: string | null;
  };
  leave: {
    pendingRequests: number;
    approvedRequestsThisYear: number;
    approvedDaysThisYear: number;
    upcomingApprovedLeave: {
      id: string;
      leaveType: string;
      startDate: string;
      endDate: string;
      days: number;
    }[];
    balances: {
      leave_type_id: string;
      name: string;
      default_days: number | null;
      used_days: number;
      remaining_days: number | null;
    }[];
  };
}
