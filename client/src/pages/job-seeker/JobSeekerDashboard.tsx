import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import type {
  FullProfile,
  GetProfileResponse,
  JobApplicationItem,
  GetMyApplicationsResponse,
  SavedJobRecord,
  GetSavedJobsResponse,
  RecommendedJobItem,
  GetRecommendedJobsResponse,
} from "../../types/profile";
import { calculateProfileCompletion } from "../../utils/profileCompletion";
import JobCard from "../../components/public/JobCard";
import {
  FileText,
  Bookmark,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Loader2,
  PlusCircle,
  Calendar,
  Video,
  Clock,
} from "lucide-react";

export default function JobSeekerDashboard() {
  const { user } = useAuth();

  // Queries
  const profileQuery = useQuery<FullProfile>({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await api.get<GetProfileResponse>("/profile/me");
      return res.data.data.profile;
    },
  });

  const applicationsQuery = useQuery<JobApplicationItem[]>({
    queryKey: ["myApplications"],
    queryFn: async () => {
      const res = await api.get<GetMyApplicationsResponse>("/applications/my");
      return res.data.data.applications;
    },
  });

  const savedJobsQuery = useQuery<SavedJobRecord[]>({
    queryKey: ["savedJobs"],
    queryFn: async () => {
      const res = await api.get<GetSavedJobsResponse>("/jobs/saved");
      return res.data.data.savedJobs;
    },
  });

  const recommendedQuery = useQuery<RecommendedJobItem[]>({
    queryKey: ["recommendedJobs"],
    queryFn: async () => {
      const res = await api.get<GetRecommendedJobsResponse>("/jobs/recommended");
      return res.data.data.recommendations;
    },
  });

  const interviewsQuery = useQuery<any[]>({
    queryKey: ["myInterviews"],
    queryFn: async () => {
      const res = await api.get("/interviews/my");
      return res.data.data.interviews;
    },
  });

  const now = new Date();
  const upcomingInterviews = (interviewsQuery.data || []).filter(
    (iv) => iv.status === "SCHEDULED" && new Date(iv.scheduled_at) >= now
  );

  const profile = profileQuery.data;
  const applications = applicationsQuery.data || [];
  const savedJobs = savedJobsQuery.data || [];
  const recommendations = recommendedQuery.data || [];

  const completion = calculateProfileCompletion(profile);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <span style={{ fontSize: "0.75rem", color: "#b45309", backgroundColor: "rgba(245, 158, 11, 0.12)", padding: "0.2rem 0.5rem", borderRadius: "9999px", fontWeight: 600 }}>
            Pending
          </span>
        );
      case "REVIEWING":
        return (
          <span style={{ fontSize: "0.75rem", color: "#1d4ed8", backgroundColor: "rgba(37, 99, 235, 0.12)", padding: "0.2rem 0.5rem", borderRadius: "9999px", fontWeight: 600 }}>
            In Review
          </span>
        );
      case "INTERVIEW":
        return (
          <span style={{ fontSize: "0.75rem", color: "#6d28d9", backgroundColor: "rgba(124, 58, 237, 0.12)", padding: "0.2rem 0.5rem", borderRadius: "9999px", fontWeight: 600 }}>
            Interview
          </span>
        );
      case "ACCEPTED":
        return (
          <span style={{ fontSize: "0.75rem", color: "#059669", backgroundColor: "rgba(16, 185, 129, 0.12)", padding: "0.2rem 0.5rem", borderRadius: "9999px", fontWeight: 600 }}>
            Accepted
          </span>
        );
      case "REJECTED":
        return (
          <span style={{ fontSize: "0.75rem", color: "#dc2626", backgroundColor: "rgba(239, 68, 68, 0.12)", padding: "0.2rem 0.5rem", borderRadius: "9999px", fontWeight: 600 }}>
            Declined
          </span>
        );
      default:
        return <span className="badge badge-gray">{status}</span>;
    }
  };

  const isInitialLoading = profileQuery.isLoading && applicationsQuery.isLoading;

  if (isInitialLoading) {
    return (
      <div className="dashboard-container" style={{ textAlign: "center", padding: "4rem 1.5rem" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "var(--text-muted)" }}>
          <Loader2 className="animate-spin" size={20} />
          <span>Loading your job seeker dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Welcome Banner */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 className="dashboard-title">
          Welcome back, {user?.first_name || "Job Seeker"}! 👋
        </h1>
        <p className="dashboard-subtitle">
          Here is an overview of your job search progress, active applications, and recommended matches.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        {/* Applications */}
        <Link to="/job-seeker/applications" className="card" style={{ textDecoration: "none", transition: "transform 0.2s, box-shadow 0.2s" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className="card-title">My Applications</span>
            <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "rgba(37, 99, 235, 0.1)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FileText size={18} />
            </div>
          </div>
          <p className="card-value">{applications.length}</p>
          <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.8125rem", color: "var(--primary)", marginTop: "0.5rem", fontWeight: 500 }}>
            <span>View all applications</span>
            <ArrowRight size={13} />
          </div>
        </Link>

        {/* Saved Jobs */}
        <Link to="/job-seeker/saved" className="card" style={{ textDecoration: "none", transition: "transform 0.2s, box-shadow 0.2s" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className="card-title">Saved Jobs</span>
            <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "rgba(245, 158, 11, 0.1)", color: "#b45309", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Bookmark size={18} />
            </div>
          </div>
          <p className="card-value">{savedJobs.length}</p>
          <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.8125rem", color: "#b45309", marginTop: "0.5rem", fontWeight: 500 }}>
            <span>View saved bookmarks</span>
            <ArrowRight size={13} />
          </div>
        </Link>

        {/* Recommended Jobs */}
        <Link to="/job-seeker/recommended" className="card" style={{ textDecoration: "none", transition: "transform 0.2s, box-shadow 0.2s" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className="card-title">Recommended Jobs</span>
            <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "rgba(124, 58, 237, 0.1)", color: "#7c3aed", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Sparkles size={18} />
            </div>
          </div>
          <p className="card-value">{recommendations.length}</p>
          <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.8125rem", color: "#7c3aed", marginTop: "0.5rem", fontWeight: 500 }}>
            <span>Explore job matches</span>
            <ArrowRight size={13} />
          </div>
        </Link>

        {/* Profile Strength */}
        <Link to="/job-seeker/profile" className="card" style={{ textDecoration: "none", transition: "transform 0.2s, box-shadow 0.2s" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className="card-title">Profile Strength</span>
            <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "rgba(16, 185, 129, 0.1)", color: "#059669", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CheckCircle2 size={18} />
            </div>
          </div>
          <p className="card-value">{completion.percentage}%</p>
          <div style={{ height: "6px", backgroundColor: "rgba(0, 0, 0, 0.06)", borderRadius: "9999px", overflow: "hidden", marginTop: "0.75rem" }}>
            <div
              style={{
                height: "100%",
                width: `${completion.percentage}%`,
                backgroundColor: completion.percentage >= 80 ? "#10b981" : "var(--primary)",
                borderRadius: "9999px",
              }}
            />
          </div>
        </Link>
      </div>

      {/* Upcoming Interviews Alert/Banner */}
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
                Upcoming Interview ({upcomingInterviews.length})
              </h3>
            </div>
            <Link to="/job-seeker/interviews" className="btn btn-secondary" style={{ fontSize: "0.75rem", padding: "0.25rem 0.5rem" }}>
              View All
            </Link>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "0.75rem" }}>
            {upcomingInterviews.slice(0, 2).map((iv: any) => {
              const job = iv.application?.Job;
              const company = job?.Company;
              const date = new Date(iv.scheduled_at);

              return (
                <div
                  key={iv.id}
                  style={{
                    padding: "0.85rem 1rem",
                    backgroundColor: "var(--bg-color)",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-color)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "0.75rem",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "0.9375rem", color: "var(--text-main)" }}>
                      {job?.title}
                    </div>
                    <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)", marginTop: "0.15rem" }}>
                      {company?.name} • <span style={{ color: "var(--primary)", fontWeight: 500 }}>{iv.interview_type}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", marginTop: "0.5rem", fontSize: "0.8125rem", color: "var(--text-main)", fontWeight: 500 }}>
                      <Clock size={13} style={{ color: "var(--primary)" }} />
                      <span>
                        {date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })},{" "}
                        {date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>

                  {iv.interview_type === "VIDEO" && iv.meeting_link && (
                    <a
                      href={iv.meeting_link}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-primary"
                      style={{ fontSize: "0.8125rem", padding: "0.35rem 0.75rem", display: "inline-flex", alignItems: "center", gap: "0.35rem" }}
                    >
                      <Video size={14} />
                      <span>Join</span>
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Profile Completion Actions (if incomplete) */}
      {completion.missingItems.length > 0 && (
        <div
          className="card"
          style={{
            marginBottom: "2rem",
            background: "linear-gradient(135deg, rgba(37, 99, 235, 0.04) 0%, rgba(37, 99, 235, 0.09) 100%)",
            borderColor: "rgba(37, 99, 235, 0.2)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <h3 style={{ margin: "0 0 0.25rem 0", fontSize: "1rem", fontWeight: 600, color: "var(--text-main)" }}>
                Complete your profile to increase your visibility to employers
              </h3>
              <p style={{ margin: 0, fontSize: "0.8125rem", color: "var(--text-muted)" }}>
                Candidates with completed profiles receive up to 3x more recruiter interactions.
              </p>
            </div>
            <Link to="/job-seeker/profile" className="btn btn-primary" style={{ fontSize: "0.8125rem", padding: "0.4rem 0.8rem" }}>
              <PlusCircle size={15} /> Complete Profile
            </Link>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "1rem" }}>
            {completion.missingItems.map((item) => (
              <Link
                key={item.key}
                to="/job-seeker/profile"
                style={{
                  fontSize: "0.75rem",
                  padding: "0.25rem 0.6rem",
                  backgroundColor: "var(--surface)",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border-color)",
                  color: "var(--primary)",
                  textDecoration: "none",
                  fontWeight: 500,
                }}
              >
                + {item.action}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Jobs Preview */}
      <div style={{ marginBottom: "2.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0, color: "var(--text-main)" }}>
              Recommended for You
            </h2>
            <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)", margin: "0.25rem 0 0 0" }}>
              Positions matched to your profile skills
            </p>
          </div>
          {recommendations.length > 0 && (
            <Link to="/job-seeker/recommended" className="btn btn-ghost" style={{ fontSize: "0.8125rem", gap: "0.25rem" }}>
              <span>View All ({recommendations.length})</span>
              <ArrowRight size={14} />
            </Link>
          )}
        </div>

        {recommendations.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "2.5rem 1rem" }}>
            <Sparkles size={28} style={{ color: "var(--text-light)", marginBottom: "0.5rem" }} />
            <p style={{ margin: "0 0 0.75rem 0", fontSize: "0.875rem", color: "var(--text-muted)" }}>
              No job recommendations yet. Add technical skills to your profile to get matches.
            </p>
            <Link to="/job-seeker/profile" className="btn btn-secondary" style={{ fontSize: "0.8125rem", margin: "0 auto" }}>
              Add Skills to Profile
            </Link>
          </div>
        ) : (
          <div className="job-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))" }}>
            {recommendations.slice(0, 3).map((item) => (
              <JobCard
                key={item.job.id}
                job={item.job}
                matchPercentage={item.match_percentage}
              />
            ))}
          </div>
        )}
      </div>

      {/* Grid: Recent Applications & Saved Jobs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "1.5rem" }}>
        {/* Recent Applications */}
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
            <h3 style={{ fontSize: "1.0625rem", fontWeight: 600, margin: 0, color: "var(--text-main)" }}>
              Recent Applications
            </h3>
            <Link to="/job-seeker/applications" className="btn btn-ghost" style={{ fontSize: "0.75rem", padding: "0.25rem 0.5rem" }}>
              View All
            </Link>
          </div>

          {applications.length === 0 ? (
            <div style={{ textAlign: "center", padding: "2rem 1rem", backgroundColor: "var(--bg-color)", borderRadius: "var(--radius-md)" }}>
              <FileText size={24} style={{ color: "var(--text-light)", marginBottom: "0.5rem" }} />
              <p style={{ margin: 0, fontSize: "0.8125rem", color: "var(--text-muted)" }}>
                No applications submitted yet.
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {applications.slice(0, 4).map((app) => (
                <div
                  key={app.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "0.75rem",
                    backgroundColor: "var(--bg-color)",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-color)",
                  }}
                >
                  <div>
                    <Link
                      to={`/jobs/${app.job_id}`}
                      style={{
                        fontWeight: 600,
                        fontSize: "0.875rem",
                        color: "var(--text-main)",
                        textDecoration: "none",
                      }}
                    >
                      {app.Job?.title || "Job Position"}
                    </Link>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
                      {app.Job?.Company?.name || "Company"}
                    </div>
                  </div>
                  <div>{getStatusBadge(app.status)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Saved Jobs Preview */}
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
            <h3 style={{ fontSize: "1.0625rem", fontWeight: 600, margin: 0, color: "var(--text-main)" }}>
              Saved Jobs Preview
            </h3>
            <Link to="/job-seeker/saved" className="btn btn-ghost" style={{ fontSize: "0.75rem", padding: "0.25rem 0.5rem" }}>
              View All
            </Link>
          </div>

          {savedJobs.length === 0 ? (
            <div style={{ textAlign: "center", padding: "2rem 1rem", backgroundColor: "var(--bg-color)", borderRadius: "var(--radius-md)" }}>
              <Bookmark size={24} style={{ color: "var(--text-light)", marginBottom: "0.5rem" }} />
              <p style={{ margin: 0, fontSize: "0.8125rem", color: "var(--text-muted)" }}>
                No saved jobs. Bookmark jobs while browsing to review later.
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {savedJobs.slice(0, 4).map((record) => {
                if (!record.job) return null;
                return (
                  <div
                    key={record.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "0.75rem",
                      backgroundColor: "var(--bg-color)",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--border-color)",
                    }}
                  >
                    <div>
                      <Link
                        to={`/jobs/${record.job_id}`}
                        style={{
                          fontWeight: 600,
                          fontSize: "0.875rem",
                          color: "var(--text-main)",
                          textDecoration: "none",
                        }}
                      >
                        {record.job.title}
                      </Link>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
                        {record.job.Company?.name || "Company"} • {record.job.location}
                      </div>
                    </div>
                    <Link
                      to={`/jobs/${record.job_id}`}
                      className="btn btn-secondary"
                      style={{ fontSize: "0.75rem", padding: "0.25rem 0.5rem" }}
                    >
                      View
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
