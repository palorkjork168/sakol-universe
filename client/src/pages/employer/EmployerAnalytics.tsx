import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../../services/api";
import { useCompanyAnalytics } from "../../hooks/useAnalytics";
import { DateRangeFilter } from "../../components/analytics/DateRangeFilter";
import { FunnelDiagram } from "../../components/analytics/FunnelDiagram";
import { TrendChart } from "../../components/analytics/TrendChart";
import { BarChart } from "../../components/analytics/BarChart";
import { SkeletonCard } from "../../components/common/Skeleton";
import type { Company, GetMyCompaniesResponse } from "../../types/job";
import {
  Users,
  Briefcase,
  UserCheck,
  Calendar,
  Clock,
  AlertCircle,
  RefreshCw,
  Building2,
  Info,
} from "lucide-react";

export default function EmployerAnalytics() {
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 86400000).toISOString().split("T")[0];

  const [from, setFrom] = useState<string>(thirtyDaysAgo);
  const [to, setTo] = useState<string>(todayStr);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");

  // 1. Fetch user's accessible companies
  const companiesQuery = useQuery<Company[]>({
    queryKey: ["myCompanies"],
    queryFn: async () => {
      const res = await api.get<GetMyCompaniesResponse>("/companies/my");
      return res.data.data.companies;
    },
    staleTime: 60 * 1000,
  });

  const companies = companiesQuery.data || [];
  const activeCompanyId = selectedCompanyId || companies[0]?.id;

  // 2. Fetch company-scoped analytics
  const analyticsQuery = useCompanyAnalytics(activeCompanyId, from, to);
  const { data, isLoading, isError, error, refetch } = analyticsQuery;

  const handleRangeChange = (newFrom: string, newTo: string) => {
    setFrom(newFrom);
    setTo(newTo);
  };

  return (
    <div style={{ maxWidth: "var(--max-width-page, 1200px)", margin: "0 auto", padding: "1.5rem" }}>
      {/* Top Header & Controls */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <h1
              style={{
                fontSize: "1.75rem",
                fontWeight: 700,
                color: "var(--color-text-main, #0f172a)",
                margin: 0,
              }}
            >
              Company Analytics
            </h1>
            {companies.length > 1 && (
              <select
                value={activeCompanyId}
                onChange={(e) => setSelectedCompanyId(e.target.value)}
                style={{
                  padding: "0.4rem 0.75rem",
                  borderRadius: "var(--radius-md, 8px)",
                  border: "1px solid var(--color-border, #cbd5e1)",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  color: "var(--color-text-main, #0f172a)",
                  background: "#ffffff",
                }}
              >
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            )}
          </div>
          <p
            style={{
              margin: "0.25rem 0 0 0",
              color: "var(--color-text-muted, #64748b)",
              fontSize: "0.95rem",
            }}
          >
            Track recruitment funnel, workforce distributions, and operational activity.
          </p>
        </div>

        <DateRangeFilter from={from} to={to} onRangeChange={handleRangeChange} />
      </div>

      {/* No Company Warning */}
      {!companiesQuery.isLoading && companies.length === 0 && (
        <div
          style={{
            background: "#fffbeb",
            border: "1px solid #fde68a",
            color: "#b45309",
            padding: "1.5rem",
            borderRadius: "var(--radius-lg, 12px)",
            textAlign: "center",
          }}
        >
          <Building2 size={32} style={{ margin: "0 auto 0.5rem auto", display: "block" }} />
          <h3 style={{ margin: "0 0 0.5rem 0" }}>No Company Profile Found</h3>
          <p style={{ margin: 0, fontSize: "0.9rem" }}>
            Please register or join a company to view recruitment and workforce analytics.
          </p>
        </div>
      )}

      {/* Error Banner */}
      {isError && (
        <div
          style={{
            background: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#991b1b",
            padding: "1rem 1.25rem",
            borderRadius: "var(--radius-lg, 12px)",
            marginBottom: "1.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <AlertCircle size={20} />
            <span>{(error as any)?.message || "Failed to load company analytics."}</span>
          </div>
          <button
            onClick={() => refetch()}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.35rem",
              padding: "0.4rem 0.8rem",
              background: "#991b1b",
              color: "#ffffff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: 500,
              fontSize: "0.85rem",
            }}
          >
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      )}

      {/* Headline Overview Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1rem",
          marginBottom: "1.75rem",
        }}
      >
        {isLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            {/* Active Headcount */}
            <div
              style={{
                background: "var(--color-bg-card, #ffffff)",
                border: "1px solid var(--color-border, #e2e8f0)",
                borderRadius: "var(--radius-lg, 12px)",
                padding: "1.25rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--color-text-muted, #64748b)" }}>
                  Active Headcount
                </span>
                <div style={{ padding: "0.4rem", borderRadius: "8px", background: "rgba(37, 99, 235, 0.1)", color: "#2563eb" }}>
                  <Users size={18} />
                </div>
              </div>
              <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--color-text-main, #0f172a)" }}>
                {data?.overview.headcount || 0}
              </div>
              <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted, #64748b)" }}>
                {data?.overview.departments || 0} depts • {data?.overview.positions || 0} positions
              </div>
            </div>

            {/* Published Jobs */}
            <div
              style={{
                background: "var(--color-bg-card, #ffffff)",
                border: "1px solid var(--color-border, #e2e8f0)",
                borderRadius: "var(--radius-lg, 12px)",
                padding: "1.25rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--color-text-muted, #64748b)" }}>
                  Active Jobs
                </span>
                <div style={{ padding: "0.4rem", borderRadius: "8px", background: "rgba(16, 185, 129, 0.1)", color: "#10b981" }}>
                  <Briefcase size={18} />
                </div>
              </div>
              <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--color-text-main, #0f172a)" }}>
                {data?.overview.jobsPublished || 0}
              </div>
              <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted, #64748b)" }}>
                {data?.overview.jobsTotal || 0} total listings
              </div>
            </div>

            {/* Applications in Period */}
            <div
              style={{
                background: "var(--color-bg-card, #ffffff)",
                border: "1px solid var(--color-border, #e2e8f0)",
                borderRadius: "var(--radius-lg, 12px)",
                padding: "1.25rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--color-text-muted, #64748b)" }}>
                  Applications
                </span>
                <div style={{ padding: "0.4rem", borderRadius: "8px", background: "rgba(245, 158, 11, 0.1)", color: "#f59e0b" }}>
                  <Briefcase size={18} />
                </div>
              </div>
              <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--color-text-main, #0f172a)" }}>
                {data?.overview.applicationsTotal || 0}
              </div>
              <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted, #64748b)" }}>
                {data?.overview.interviewsTotal || 0} interviews scheduled
              </div>
            </div>

            {/* Confirmed Hires */}
            <div
              style={{
                background: "var(--color-bg-card, #ffffff)",
                border: "1px solid var(--color-border, #e2e8f0)",
                borderRadius: "var(--radius-lg, 12px)",
                padding: "1.25rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--color-text-muted, #64748b)" }}>
                  Confirmed Hires
                </span>
                <div style={{ padding: "0.4rem", borderRadius: "8px", background: "rgba(5, 150, 105, 0.1)", color: "#059669" }}>
                  <UserCheck size={18} />
                </div>
              </div>
              <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--color-text-main, #0f172a)" }}>
                {data?.overview.hiresTotal || 0}
              </div>
              <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted, #64748b)" }}>
                Converted from applications
              </div>
            </div>

            {/* Pending Leaves */}
            <div
              style={{
                background: "var(--color-bg-card, #ffffff)",
                border: "1px solid var(--color-border, #e2e8f0)",
                borderRadius: "var(--radius-lg, 12px)",
                padding: "1.25rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--color-text-muted, #64748b)" }}>
                  Pending Leaves
                </span>
                <div style={{ padding: "0.4rem", borderRadius: "8px", background: "rgba(236, 72, 153, 0.1)", color: "#ec4899" }}>
                  <Calendar size={18} />
                </div>
              </div>
              <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--color-text-main, #0f172a)" }}>
                {data?.overview.pendingLeaveRequests || 0}
              </div>
              <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted, #64748b)" }}>
                Awaiting approval
              </div>
            </div>

            {/* Checked In Today */}
            <div
              style={{
                background: "var(--color-bg-card, #ffffff)",
                border: "1px solid var(--color-border, #e2e8f0)",
                borderRadius: "var(--radius-lg, 12px)",
                padding: "1.25rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--color-text-muted, #64748b)" }}>
                  Checked In Today
                </span>
                <div style={{ padding: "0.4rem", borderRadius: "8px", background: "rgba(6, 182, 212, 0.1)", color: "#06b6d4" }}>
                  <Clock size={18} />
                </div>
              </div>
              <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--color-text-main, #0f172a)" }}>
                {data?.attendance.checkedInToday || 0}
              </div>
              <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted, #64748b)" }}>
                {data?.attendance.activeSessionsNow || 0} sessions currently open
              </div>
            </div>
          </>
        )}
      </div>

      {/* Recruitment Funnel Section */}
      {data?.funnel && (
        <div style={{ marginBottom: "2rem" }}>
          <FunnelDiagram funnel={data.funnel} />
        </div>
      )}

      {/* Applications per Job Table */}
      <div
        style={{
          background: "var(--color-bg-card, #ffffff)",
          borderRadius: "var(--radius-lg, 12px)",
          border: "1px solid var(--color-border, #e2e8f0)",
          padding: "1.25rem",
          marginBottom: "2rem",
          boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "1rem" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 600, color: "var(--color-text-main, #1e293b)" }}>
              Applications by Job
            </h3>
            <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.8rem", color: "var(--color-text-muted, #64748b)" }}>
              Detailed applicant volume and stage conversion per active job posting
            </p>
          </div>
        </div>

        {data?.topJobs && data.topJobs.length > 0 ? (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.875rem" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--color-border, #e2e8f0)", color: "var(--color-text-muted, #64748b)" }}>
                  <th style={{ padding: "0.75rem 0.5rem", fontWeight: 600 }}>Job Title</th>
                  <th style={{ padding: "0.75rem 0.5rem", fontWeight: 600 }}>Status</th>
                  <th style={{ padding: "0.75rem 0.5rem", fontWeight: 600, textAlign: "right" }}>Applications</th>
                  <th style={{ padding: "0.75rem 0.5rem", fontWeight: 600, textAlign: "right" }}>Interviews</th>
                  <th style={{ padding: "0.75rem 0.5rem", fontWeight: 600, textAlign: "right" }}>Accepted</th>
                  <th style={{ padding: "0.75rem 0.5rem", fontWeight: 600, textAlign: "right" }}>Hired</th>
                </tr>
              </thead>
              <tbody>
                {data.topJobs.map((job) => (
                  <tr key={job.id} style={{ borderBottom: "1px solid var(--color-border, #f1f5f9)" }}>
                    <td style={{ padding: "0.75rem 0.5rem", fontWeight: 600, color: "var(--color-text-main, #1e293b)" }}>
                      {job.title}
                    </td>
                    <td style={{ padding: "0.75rem 0.5rem" }}>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          padding: "0.2rem 0.5rem",
                          borderRadius: "999px",
                          fontWeight: 600,
                          background: job.status === "PUBLISHED" ? "rgba(16, 185, 129, 0.1)" : "rgba(100, 116, 139, 0.1)",
                          color: job.status === "PUBLISHED" ? "#059669" : "#64748b",
                        }}
                      >
                        {job.status}
                      </span>
                    </td>
                    <td style={{ padding: "0.75rem 0.5rem", textAlign: "right", fontWeight: 600 }}>
                      {job.applicationCount}
                    </td>
                    <td style={{ padding: "0.75rem 0.5rem", textAlign: "right", color: "#64748b" }}>
                      {job.interviewCount}
                    </td>
                    <td style={{ padding: "0.75rem 0.5rem", textAlign: "right", color: "#64748b" }}>
                      {job.acceptedCount}
                    </td>
                    <td style={{ padding: "0.75rem 0.5rem", textAlign: "right", fontWeight: 700, color: "#059669" }}>
                      {job.hireCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: "2rem", textAlign: "center", color: "var(--color-text-muted, #94a3b8)", fontSize: "0.875rem" }}>
            No job applications recorded for this period.
          </div>
        )}
      </div>

      {/* Workforce Breakdown & Distributions */}
      <h2 style={{ fontSize: "1.15rem", fontWeight: 600, color: "var(--color-text-main, #0f172a)", marginBottom: "1rem" }}>
        Workforce Headcount & Distributions
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "1.25rem",
          marginBottom: "2rem",
        }}
      >
        <BarChart
          title="Employees by Department"
          items={
            data?.workforce.byDepartment.map((d) => ({
              label: d.name,
              count: d.count,
            })) || []
          }
          emptyMessage="No department assignments recorded."
        />

        <BarChart
          title="Employees by Position"
          items={
            data?.workforce.byPosition.map((p) => ({
              label: p.title,
              count: p.count,
            })) || []
          }
          emptyMessage="No position assignments recorded."
        />
      </div>

      {/* Attendance & Leave Operational Metrics */}
      <h2 style={{ fontSize: "1.15rem", fontWeight: 600, color: "var(--color-text-main, #0f172a)", marginBottom: "1rem" }}>
        Workforce Operations
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "1.25rem",
          marginBottom: "1.5rem",
        }}
      >
        {/* Attendance Summary */}
        <div
          style={{
            background: "var(--color-bg-card, #ffffff)",
            borderRadius: "var(--radius-lg, 12px)",
            border: "1px solid var(--color-border, #e2e8f0)",
            padding: "1.25rem",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
          }}
        >
          <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 600, color: "var(--color-text-main, #1e293b)" }}>
            Attendance Activity
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <div style={{ background: "var(--color-bg-subtle, #f8fafc)", padding: "0.75rem", borderRadius: "8px" }}>
              <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted, #64748b)" }}>Completed Sessions</div>
              <div style={{ fontSize: "1.35rem", fontWeight: 700, color: "var(--color-text-main, #1e293b)" }}>
                {data?.attendance.completedSessions || 0}
              </div>
            </div>
            <div style={{ background: "var(--color-bg-subtle, #f8fafc)", padding: "0.75rem", borderRadius: "8px" }}>
              <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted, #64748b)" }}>Total Hours Completed</div>
              <div style={{ fontSize: "1.35rem", fontWeight: 700, color: "#2563eb" }}>
                {data?.attendance.totalHoursCompleted || 0}h
              </div>
            </div>
            <div style={{ background: "var(--color-bg-subtle, #f8fafc)", padding: "0.75rem", borderRadius: "8px" }}>
              <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted, #64748b)" }}>Average Session Duration</div>
              <div style={{ fontSize: "1.35rem", fontWeight: 700, color: "var(--color-text-main, #1e293b)" }}>
                {data?.attendance.avgSessionDurationHours !== null ? `${data?.attendance.avgSessionDurationHours}h` : "N/A"}
              </div>
            </div>
            <div style={{ background: "var(--color-bg-subtle, #f8fafc)", padding: "0.75rem", borderRadius: "8px" }}>
              <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted, #64748b)" }}>Active Sessions Now</div>
              <div style={{ fontSize: "1.35rem", fontWeight: 700, color: "#059669" }}>
                {data?.attendance.activeSessionsNow || 0}
              </div>
            </div>
          </div>

          {/* Explicit Notice regarding Unsupported Metrics */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "0.5rem",
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              padding: "0.6rem 0.75rem",
              borderRadius: "6px",
              fontSize: "0.75rem",
              color: "#64748b",
              lineHeight: 1.4,
            }}
          >
            <Info size={16} style={{ flexShrink: 0, marginTop: "2px", color: "#64748b" }} />
            <span>
              <strong>Note on Rates:</strong> Lateness rate, absence rate, and productivity scores are not calculated
              because expected work shift schedules and hours are not defined in the system.
            </span>
          </div>
        </div>

        {/* Leave Summary */}
        <div
          style={{
            background: "var(--color-bg-card, #ffffff)",
            borderRadius: "var(--radius-lg, 12px)",
            border: "1px solid var(--color-border, #e2e8f0)",
            padding: "1.25rem",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 600, color: "var(--color-text-main, #1e293b)" }}>
              Leave Requests & Utilization
            </h3>
            <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted, #64748b)" }}>
              Approved: <strong style={{ color: "#059669" }}>{data?.leave.approvedLeaveDays || 0} days</strong>
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.5rem", textAlign: "center" }}>
            <div style={{ background: "#f8fafc", padding: "0.5rem", borderRadius: "6px" }}>
              <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Pending</div>
              <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#f59e0b" }}>
                {data?.leave.summary.pending || 0}
              </div>
            </div>
            <div style={{ background: "#f8fafc", padding: "0.5rem", borderRadius: "6px" }}>
              <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Approved</div>
              <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#10b981" }}>
                {data?.leave.summary.approved || 0}
              </div>
            </div>
            <div style={{ background: "#f8fafc", padding: "0.5rem", borderRadius: "6px" }}>
              <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Rejected</div>
              <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#ef4444" }}>
                {data?.leave.summary.rejected || 0}
              </div>
            </div>
            <div style={{ background: "#f8fafc", padding: "0.5rem", borderRadius: "6px" }}>
              <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Cancelled</div>
              <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#64748b" }}>
                {data?.leave.summary.cancelled || 0}
              </div>
            </div>
          </div>

          <div style={{ marginTop: "0.5rem" }}>
            <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "#475569", marginBottom: "0.5rem" }}>
              Leave by Type
            </div>
            {data?.leave.byType && data.leave.byType.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                {data.leave.byType.map((t) => (
                  <div
                    key={t.name}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "0.8rem",
                      color: "#334155",
                      borderBottom: "1px dashed #f1f5f9",
                      paddingBottom: "0.25rem",
                    }}
                  >
                    <span>{t.name}</span>
                    <span style={{ color: "#64748b" }}>
                      {t.count} requests ({t.approvedDays} approved days)
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: "0.8rem", color: "#94a3b8" }}>No leave requests recorded for this period.</div>
            )}
          </div>
        </div>
      </div>

      {/* Attendance Check-in Trend Chart */}
      {data?.attendance.sessionsOverTime && (
        <TrendChart
          title="Daily Attendance Check-ins"
          data={data.attendance.sessionsOverTime}
          color="#06b6d4"
          emptyMessage="No attendance sessions recorded in selected date range."
        />
      )}
    </div>
  );
}
