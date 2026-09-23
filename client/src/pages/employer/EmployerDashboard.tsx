import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import type { Company, Job, GetMyCompaniesResponse, GetMyJobsResponse } from "../../types/job";
import {
  Briefcase,
  Users,
  CheckCircle2,
  Clock,
  PlusCircle,
  Building2,
  ArrowRight,
  AlertTriangle,
  Eye,
  FileText,
  Calendar,
} from "lucide-react";
import { Skeleton, SkeletonStatCard } from "../../components/common/Skeleton";

export default function EmployerDashboard() {
  const { user } = useAuth();

  const companiesQuery = useQuery<Company[]>({
    queryKey: ["myCompanies"],
    queryFn: async () => {
      const res = await api.get<GetMyCompaniesResponse>("/companies/my");
      return res.data.data.companies;
    },
    staleTime: 60 * 1000,
  });

  const jobsQuery = useQuery<Job[]>({
    queryKey: ["myJobs"],
    queryFn: async () => {
      const res = await api.get<GetMyJobsResponse>("/jobs/my");
      return res.data.data.jobs;
    },
    staleTime: 60 * 1000,
  });

  const interviewsQuery = useQuery<any[]>({
    queryKey: ["employerInterviews", "upcoming"],
    queryFn: async () => {
      const res = await api.get("/interviews/employer/my?upcoming=true");
      return res.data.data.interviews;
    },
    staleTime: 60 * 1000,
  });

  const upcomingInterviews = interviewsQuery.data || [];

  const companies = companiesQuery.data || [];
  const jobs = jobsQuery.data || [];

  const totalJobs = jobs.length;
  const publishedJobs = jobs.filter((j) => j.status === "PUBLISHED").length;

  // Compute total applications and pending applications across all employer jobs
  const totalApplicants = jobs.reduce((acc, job) => acc + (job.Applications?.length || 0), 0);
  const pendingApplicants = jobs.reduce(
    (acc, job) => acc + (job.Applications?.filter((a) => a.status === "PENDING").length || 0),
    0
  );

  const isInitialLoading = companiesQuery.isLoading && jobsQuery.isLoading;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return (
          <span style={{ fontSize: "0.75rem", fontWeight: 600, padding: "0.2rem 0.6rem", borderRadius: "9999px", backgroundColor: "rgba(16, 185, 129, 0.12)", color: "#059669", border: "1px solid rgba(16, 185, 129, 0.3)" }}>
            Published
          </span>
        );
      case "DRAFT":
        return (
          <span style={{ fontSize: "0.75rem", fontWeight: 600, padding: "0.2rem 0.6rem", borderRadius: "9999px", backgroundColor: "rgba(245, 158, 11, 0.12)", color: "#b45309", border: "1px solid rgba(245, 158, 11, 0.3)" }}>
            Draft
          </span>
        );
      case "CLOSED":
        return (
          <span style={{ fontSize: "0.75rem", fontWeight: 600, padding: "0.2rem 0.6rem", borderRadius: "9999px", backgroundColor: "rgba(107, 114, 128, 0.12)", color: "#4b5563", border: "1px solid rgba(107, 114, 128, 0.3)" }}>
            Closed
          </span>
        );
      default:
        return <span className="badge badge-gray">{status}</span>;
    }
  };

  return (
    <div className="dashboard-container">
      {/* Welcome Banner */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem", marginBottom: "2rem" }}>
        <div>
          <h1 className="dashboard-title">
            Welcome back, {user?.first_name || "Employer"}! 👋
          </h1>
          <p className="dashboard-subtitle">
            Manage your company job listings, review inbound candidates, and track recruitment progress.
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <Link to="/employer/jobs/new" className="btn btn-primary" style={{ fontSize: "0.875rem" }}>
            <PlusCircle size={16} /> Post a Job
          </Link>
          <Link to="/employer/company" className="btn btn-secondary" style={{ fontSize: "0.875rem" }}>
            <Building2 size={16} /> Manage Company
          </Link>
        </div>
      </div>

      {/* Warning if no company profile exists */}
      {companies.length === 0 && (
        <div
          style={{
            padding: "1.25rem 1.5rem",
            backgroundColor: "var(--warning-bg)",
            border: "1px solid rgba(245, 158, 11, 0.3)",
            borderRadius: "var(--radius-lg)",
            marginBottom: "2rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <AlertTriangle size={24} style={{ color: "var(--warning-text)", flexShrink: 0 }} />
            <div>
              <strong style={{ color: "var(--warning-text)", fontSize: "0.9375rem" }}>
                Company Profile Setup Required
              </strong>
              <div style={{ fontSize: "0.8125rem", color: "var(--warning-text)", marginTop: "0.15rem" }}>
                You must register your company before posting jobs so candidates know who is hiring.
              </div>
            </div>
          </div>
          <Link to="/employer/company" className="btn btn-primary" style={{ fontSize: "0.8125rem" }}>
            Complete Company Setup
          </Link>
        </div>
      )}

      {/* Summary Cards */}
      {isInitialLoading ? (
        <div className="summary-cards" style={{ marginBottom: "2.5rem" }}>
          <SkeletonStatCard />
          <SkeletonStatCard />
          <SkeletonStatCard />
          <SkeletonStatCard />
        </div>
      ) : (
        <div className="summary-cards" style={{ marginBottom: "2.5rem" }}>
          {/* Total Jobs */}
          <Link to="/employer/jobs" className="card" style={{ textDecoration: "none", transition: "transform 0.2s" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className="card-title">Total Postings</span>
              <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "rgba(37, 99, 235, 0.1)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Briefcase size={18} />
              </div>
            </div>
            <p className="card-value">{totalJobs}</p>
            <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.8125rem", color: "var(--primary)", marginTop: "0.5rem", fontWeight: 500 }}>
              <span>Manage all listings</span>
              <ArrowRight size={13} />
            </div>
          </Link>

        {/* Published Jobs */}
        <Link to="/employer/jobs" className="card" style={{ textDecoration: "none", transition: "transform 0.2s" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className="card-title">Live / Published</span>
            <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "rgba(16, 185, 129, 0.1)", color: "#059669", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CheckCircle2 size={18} />
            </div>
          </div>
          <p className="card-value">{publishedJobs}</p>
          <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.8125rem", color: "#059669", marginTop: "0.5rem", fontWeight: 500 }}>
            <span>View public jobs</span>
            <ArrowRight size={13} />
          </div>
        </Link>

        {/* Total Applicants */}
        <Link to="/employer/applicants" className="card" style={{ textDecoration: "none", transition: "transform 0.2s" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className="card-title">Total Applicants</span>
            <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "rgba(124, 58, 237, 0.1)", color: "#7c3aed", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Users size={18} />
            </div>
          </div>
          <p className="card-value">{totalApplicants}</p>
          <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.8125rem", color: "#7c3aed", marginTop: "0.5rem", fontWeight: 500 }}>
            <span>Candidate pool</span>
            <ArrowRight size={13} />
          </div>
        </Link>

        {/* Needing Review */}
        <Link to="/employer/applicants" className="card" style={{ textDecoration: "none", transition: "transform 0.2s" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className="card-title">Needs Review</span>
            <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "rgba(245, 158, 11, 0.1)", color: "#b45309", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Clock size={18} />
            </div>
          </div>
          <p className="card-value">{pendingApplicants}</p>
          <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.8125rem", color: "#b45309", marginTop: "0.5rem", fontWeight: 500 }}>
            <span>Review pending</span>
            <ArrowRight size={13} />
          </div>
        </Link>
      </div>
      )}

      {/* Upcoming Interviews Banner/Card */}
      {upcomingInterviews.length > 0 && (
        <div
          className="card"
          style={{
            marginBottom: "2rem",
            borderLeft: "4px solid var(--primary)",
            padding: "1.25rem 1.5rem",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Calendar size={18} style={{ color: "var(--primary)" }} />
              <h3 style={{ margin: 0, fontSize: "1.0625rem", fontWeight: 600, color: "var(--text-main)" }}>
                Upcoming Interviews ({upcomingInterviews.length})
              </h3>
            </div>
            <Link to="/employer/interviews" className="btn btn-secondary" style={{ fontSize: "0.75rem", padding: "0.25rem 0.5rem" }}>
              View Schedule
            </Link>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "0.75rem" }}>
            {upcomingInterviews.slice(0, 3).map((iv: any) => {
              const app = iv.application;
              const applicant = app?.applicant;
              const job = app?.Job;
              const date = new Date(iv.scheduled_at);

              return (
                <div
                  key={iv.id}
                  style={{
                    padding: "0.75rem 1rem",
                    backgroundColor: "var(--bg-color)",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-color)",
                    fontSize: "0.8125rem",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <strong style={{ color: "var(--text-main)" }}>
                      {applicant?.first_name} {applicant?.last_name}
                    </strong>
                    <span style={{ color: "var(--primary)", fontWeight: 600, fontSize: "0.75rem" }}>
                      {iv.interview_type}
                    </span>
                  </div>
                  <div style={{ color: "var(--text-muted)", fontSize: "0.75rem", marginTop: "0.2rem" }}>
                    {job?.title}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", marginTop: "0.5rem", color: "var(--text-main)", fontWeight: 500 }}>
                    <Clock size={12} style={{ color: "var(--primary)" }} />
                    <span>
                      {date.toLocaleDateString(undefined, { month: "short", day: "numeric" })},{" "}
                      {date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    <span style={{ color: "var(--text-muted)" }}>({iv.duration_minutes}m)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Grid: Recent Jobs & Inbound Applicants */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "1.5rem" }}>
        {/* Recent Jobs */}
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
            <h3 style={{ fontSize: "1.0625rem", fontWeight: 600, margin: 0, color: "var(--text-main)" }}>
              Recent Job Postings
            </h3>
            <Link to="/employer/jobs" className="btn btn-ghost" style={{ fontSize: "0.75rem", padding: "0.25rem 0.5rem" }}>
              View All ({jobs.length})
            </Link>
          </div>

          {jobsQuery.isLoading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <Skeleton height="56px" borderRadius="var(--radius-md)" />
              <Skeleton height="56px" borderRadius="var(--radius-md)" />
              <Skeleton height="56px" borderRadius="var(--radius-md)" />
            </div>
          ) : jobs.length === 0 ? (
            <div style={{ textAlign: "center", padding: "2.5rem 1rem", backgroundColor: "var(--bg-color)", borderRadius: "var(--radius-md)" }}>
              <Briefcase size={28} style={{ color: "var(--text-light)", marginBottom: "0.5rem" }} />
              <p style={{ margin: "0 0 0.75rem 0", fontSize: "0.875rem", color: "var(--text-muted)" }}>
                No job postings created yet.
              </p>
              <Link to="/employer/jobs/new" className="btn btn-primary" style={{ fontSize: "0.8125rem" }}>
                Post Your First Job
              </Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {jobs.slice(0, 4).map((job) => (
                <div
                  key={job.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "0.875rem 1rem",
                    backgroundColor: "var(--bg-color)",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-color)",
                  }}
                >
                  <div>
                    <Link
                      to={`/employer/jobs/${job.id}/edit`}
                      style={{
                        fontWeight: 600,
                        fontSize: "0.9375rem",
                        color: "var(--text-main)",
                        textDecoration: "none",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "var(--primary)")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-main)")}
                    >
                      {job.title}
                    </Link>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
                      {job.Company?.name} • {job.location} • {job.Applications?.length || 0} applicants
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    {getStatusBadge(job.status)}
                    <Link
                      to={`/employer/jobs/${job.id}/edit`}
                      className="btn btn-secondary"
                      style={{ fontSize: "0.75rem", padding: "0.25rem 0.5rem" }}
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Center / Applicant Review */}
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
            <h3 style={{ fontSize: "1.0625rem", fontWeight: 600, margin: 0, color: "var(--text-main)" }}>
              Applicant Pipeline Summary
            </h3>
            <Link to="/employer/applicants" className="btn btn-ghost" style={{ fontSize: "0.75rem", padding: "0.25rem 0.5rem" }}>
              All Applicants
            </Link>
          </div>

          {jobsQuery.isLoading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <Skeleton height="56px" borderRadius="var(--radius-md)" />
              <Skeleton height="56px" borderRadius="var(--radius-md)" />
              <Skeleton height="56px" borderRadius="var(--radius-md)" />
            </div>
          ) : jobs.filter((j) => (j.Applications?.length || 0) > 0).length === 0 ? (
            <div style={{ textAlign: "center", padding: "2.5rem 1rem", backgroundColor: "var(--bg-color)", borderRadius: "var(--radius-md)" }}>
              <FileText size={28} style={{ color: "var(--text-light)", marginBottom: "0.5rem" }} />
              <p style={{ margin: "0 0 0.5rem 0", fontSize: "0.875rem", color: "var(--text-muted)" }}>
                No candidates have applied to your active postings yet.
              </p>
              <div style={{ fontSize: "0.8125rem", color: "var(--text-light)" }}>
                Publish listings to the public career marketplace to receive applicants.
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {jobs
                .filter((j) => (j.Applications?.length || 0) > 0)
                .slice(0, 4)
                .map((job) => {
                  const pending = job.Applications?.filter((a) => a.status === "PENDING").length || 0;
                  return (
                    <div
                      key={job.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "0.875rem 1rem",
                        backgroundColor: "var(--bg-color)",
                        borderRadius: "var(--radius-md)",
                        border: "1px solid var(--border-color)",
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--text-main)" }}>
                          {job.title}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
                          Total: <strong>{job.Applications?.length}</strong> applicants
                          {pending > 0 && (
                            <span style={{ color: "#b45309", marginLeft: "0.5rem", fontWeight: 600 }}>
                              • {pending} pending review
                            </span>
                          )}
                        </div>
                      </div>
                      <Link
                        to={`/employer/applicants?jobId=${job.id}`}
                        className="btn btn-secondary"
                        style={{ fontSize: "0.75rem", padding: "0.3rem 0.6rem" }}
                      >
                        <Eye size={12} />
                        <span>Review</span>
                      </Link>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
