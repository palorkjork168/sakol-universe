import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../../services/api";
import type { RecommendedJobItem, GetRecommendedJobsResponse } from "../../types/profile";
import JobCard from "../../components/public/JobCard";
import { Sparkles, ArrowRight, Loader2, AlertCircle, Info } from "lucide-react";

export default function RecommendedJobs() {
  const { data: recommendations, isLoading, error } = useQuery<RecommendedJobItem[]>({
    queryKey: ["recommendedJobs"],
    queryFn: async () => {
      const res = await api.get<GetRecommendedJobsResponse>("/jobs/recommended");
      return res.data.data.recommendations;
    },
  });

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header" style={{ marginBottom: "1.25rem" }}>
        <div>
          <h1 className="dashboard-title">Recommended Jobs</h1>
          <p className="dashboard-subtitle">
            Opportunities matched to your skills and background
          </p>
        </div>
        <Link to="/job-seeker/profile" className="btn btn-secondary" style={{ fontSize: "0.875rem" }}>
          <span>Update Profile Skills</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* Info Notice */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "0.75rem",
          padding: "1rem 1.25rem",
          backgroundColor: "rgba(37, 99, 235, 0.05)",
          border: "1px solid rgba(37, 99, 235, 0.15)",
          borderRadius: "var(--radius-md)",
          marginBottom: "1.5rem",
        }}
      >
        <Info size={18} style={{ color: "var(--primary)", flexShrink: 0, marginTop: "0.1rem" }} />
        <div style={{ fontSize: "0.84375rem", color: "var(--text-main)", lineHeight: 1.5 }}>
          <strong>How recommendations work:</strong> Our matching engine evaluates the technical and soft skills listed in your profile against the required and preferred skills on active job postings. Adding more relevant skills to your profile increases recommendation accuracy.
        </div>
      </div>

      {isLoading && (
        <div style={{ textAlign: "center", padding: "3rem" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "var(--text-muted)" }}>
            <Loader2 className="animate-spin" size={20} />
            <span>Analyzing matches and loading recommendations...</span>
          </div>
        </div>
      )}

      {error && (
        <div
          style={{
            padding: "1.5rem",
            backgroundColor: "var(--danger-bg)",
            color: "var(--danger-text)",
            borderRadius: "var(--radius-lg)",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <AlertCircle size={18} />
          <span>Failed to load job recommendations. Please try again.</span>
        </div>
      )}

      {!isLoading && !error && (!recommendations || recommendations.length === 0) && (
        <div
          className="card"
          style={{
            textAlign: "center",
            padding: "3.5rem 1.5rem",
            alignItems: "center",
          }}
        >
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              backgroundColor: "rgba(124, 58, 237, 0.1)",
              color: "#7c3aed",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "1rem",
            }}
          >
            <Sparkles size={30} />
          </div>
          <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.125rem", color: "var(--text-main)" }}>
            No recommended jobs found yet
          </h3>
          <p style={{ margin: "0 0 1.5rem 0", color: "var(--text-muted)", maxWidth: "440px", fontSize: "0.875rem" }}>
            Add skills to your profile such as programming languages, design tools, or management experience to start seeing personalized recommendations.
          </p>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", justifyContent: "center" }}>
            <Link to="/job-seeker/profile" className="btn btn-primary">
              <Sparkles size={16} /> Add Skills to Profile
            </Link>
            <Link to="/jobs" className="btn btn-secondary">
              Browse All Jobs
            </Link>
          </div>
        </div>
      )}

      {!isLoading && !error && recommendations && recommendations.length > 0 && (
        <div className="job-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))" }}>
          {recommendations.map((item) => (
            <JobCard
              key={item.job.id}
              job={item.job}
              matchPercentage={item.match_percentage}
            />
          ))}
        </div>
      )}
    </div>
  );
}
