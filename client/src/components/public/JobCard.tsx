import { Link } from "react-router-dom";
import type { Job } from "../../types/job";
import { MapPin, Clock, Building2, Globe2 } from "lucide-react";

interface JobCardProps {
  job: Job;
  matchPercentage?: number;
  actionButton?: React.ReactNode;
}

export default function JobCard({ job, matchPercentage, actionButton }: JobCardProps) {
  const getInitials = (name?: string) => {
    if (!name) return "SO";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const formatEmploymentType = (type: string) => {
    switch (type) {
      case "FULL_TIME": return "Full-Time";
      case "PART_TIME": return "Part-Time";
      case "CONTRACT": return "Contract";
      case "INTERNSHIP": return "Internship";
      case "FREELANCE": return "Freelance";
      default: return type;
    }
  };

  const formatExperienceLevel = (level?: string | null) => {
    if (!level) return null;
    switch (level) {
      case "ENTRY": return "Entry Level";
      case "JUNIOR": return "Junior";
      case "MID": return "Mid Level";
      case "SENIOR": return "Senior";
      case "LEAD": return "Lead / Manager";
      default: return level;
    }
  };

  const formatSalary = () => {
    const currency = job.salary_currency || "$";
    if (job.salary_min && job.salary_max) {
      return `${currency}${job.salary_min.toLocaleString()} - ${currency}${job.salary_max.toLocaleString()}`;
    }
    if (job.salary_min) {
      return `From ${currency}${job.salary_min.toLocaleString()}`;
    }
    if (job.salary_max) {
      return `Up to ${currency}${job.salary_max.toLocaleString()}`;
    }
    return null;
  };

  const formatTimeAgo = (dateStr: string) => {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 30) return `${diffDays}d ago`;
    return new Date(dateStr).toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  const salaryDisplay = formatSalary();

  return (
    <Link to={`/jobs/${job.id}`} className="job-card">
      <div className="job-card-header">
        <div className="company-avatar">
          {job.Company?.logo_url ? (
            <img src={job.Company.logo_url} alt={job.Company.name} />
          ) : (
            getInitials(job.Company?.name)
          )}
        </div>
        <div className="job-card-title-area">
          <h3 className="job-card-title">{job.title}</h3>
          <div className="job-card-company">
            <Building2 size={14} />
            <span>{job.Company?.name || "Verified Company"}</span>
          </div>
        </div>
      </div>

      <div className="job-card-meta">
        <div className="meta-item">
          <MapPin size={14} />
          <span>{job.location}</span>
        </div>
        {job.is_remote && (
          <div className="meta-item" style={{ color: "var(--primary)" }}>
            <Globe2 size={14} />
            <span>Remote</span>
          </div>
        )}
      </div>

      <div className="job-card-badges">
        {matchPercentage !== undefined && (
          <span
            className="badge-pill"
            style={{
              backgroundColor: "rgba(16, 185, 129, 0.12)",
              color: "#059669",
              fontWeight: 600,
              border: "1px solid rgba(16, 185, 129, 0.3)",
            }}
          >
            🎯 {matchPercentage}% Match
          </span>
        )}
        <span className="badge-pill badge-pill-primary">
          {formatEmploymentType(job.employment_type)}
        </span>
        {job.experience_level && (
          <span className="badge-pill badge-pill-gray">
            {formatExperienceLevel(job.experience_level)}
          </span>
        )}
        {job.Company?.industry && (
          <span className="badge-pill badge-pill-gray">
            {job.Company.industry}
          </span>
        )}
      </div>

      <p className="job-card-description">
        {job.description}
      </p>

      <div className="job-card-footer">
        {salaryDisplay ? (
          <div className="salary-tag">
            {salaryDisplay}
          </div>
        ) : (
          <span style={{ color: "var(--text-light)" }}>Competitive Salary</span>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          {actionButton && (
            <div onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
              {actionButton}
            </div>
          )}
          <div className="meta-item">
            <Clock size={13} />
            <span>{formatTimeAgo(job.created_at)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
