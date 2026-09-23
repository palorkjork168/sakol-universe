import { Link } from "react-router-dom";
import type { Job } from "../../types/job";
import { MapPin, Clock, Building2, Globe2, Sparkles } from "lucide-react";

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

  const formatTimeAgo = (dateStr?: string) => {
    if (!dateStr) return "Recently";
    const parsed = new Date(dateStr);
    const time = parsed.getTime();
    if (isNaN(time)) return "Recently";
    const diffMs = Date.now() - time;
    if (diffMs < 0) return "Just now";
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 30) return `${diffDays}d ago`;
    return parsed.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  const salaryDisplay = formatSalary();

  return (
    <Link
      to={`/jobs/${job.id}`}
      className="card card-clickable"
      style={{
        display: "flex",
        flexDirection: "column",
        textDecoration: "none",
        padding: "1.5rem",
        minWidth: 0,
        height: "100%",
      }}
    >
      {/* Card Header: Avatar + Title */}
      <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start", marginBottom: "1rem", minWidth: 0 }}>
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "var(--radius-lg)",
            backgroundColor: "var(--color-surface-muted)",
            border: "1px solid var(--color-border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            fontSize: "1rem",
            color: "var(--color-primary)",
            flexShrink: 0,
            overflow: "hidden",
          }}
        >
          {job.Company?.logo_url ? (
            <img src={job.Company.logo_url} alt={job.Company.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            getInitials(job.Company?.name)
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <h3
            title={job.title}
            style={{
              fontSize: "1.125rem",
              fontWeight: 700,
              color: "var(--color-text)",
              margin: "0 0 0.375rem",
              lineHeight: 1.35,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              wordBreak: "break-word",
            }}
          >
            {job.title}
          </h3>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.375rem",
              color: "var(--color-text-secondary)",
              fontSize: "0.875rem",
              minWidth: 0,
            }}
          >
            <Building2 size={14} style={{ color: "var(--color-text-muted)", flexShrink: 0 }} />
            <span
              title={job.Company?.name || "Verified Employer"}
              style={{
                fontWeight: 500,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                display: "inline-block",
                maxWidth: "100%",
              }}
            >
              {job.Company?.name || "Verified Employer"}
            </span>
          </div>
        </div>
      </div>

      {/* Location and Remote */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.875rem",
          fontSize: "0.8125rem",
          color: "var(--color-text-secondary)",
          marginBottom: "1rem",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
          <MapPin size={14} style={{ color: "var(--color-text-muted)", flexShrink: 0 }} />
          <span>{job.location}</span>
        </div>
        {job.is_remote && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", color: "var(--color-primary)", fontWeight: 600 }}>
            <Globe2 size={14} style={{ flexShrink: 0 }} />
            <span>Remote</span>
          </div>
        )}
      </div>

      {/* Badges / Tags */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1rem" }}>
        {matchPercentage !== undefined && (
          <span className="badge badge-success">
            <Sparkles size={12} />
            {matchPercentage}% Match
          </span>
        )}
        <span className="badge badge-info">
          {formatEmploymentType(job.employment_type)}
        </span>
        {job.experience_level && (
          <span className="badge badge-neutral">
            {formatExperienceLevel(job.experience_level)}
          </span>
        )}
        {job.Company?.industry && (
          <span className="badge badge-neutral">
            {job.Company.industry}
          </span>
        )}
      </div>

      {/* Description Preview */}
      <p
        style={{
          fontSize: "0.875rem",
          color: "var(--color-text-secondary)",
          lineHeight: 1.5,
          marginBottom: "1.25rem",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          flex: 1,
        }}
      >
        {job.description}
      </p>

      {/* Card Footer: Salary & Time */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderTop: "1px solid var(--color-border-subtle)",
          paddingTop: "0.875rem",
          fontSize: "0.8125rem",
          color: "var(--color-text-muted)",
          flexWrap: "wrap",
          gap: "0.5rem",
        }}
      >
        <div>
          {salaryDisplay ? (
            <strong style={{ color: "var(--color-text)", fontSize: "0.9375rem" }}>{salaryDisplay}</strong>
          ) : (
            <span>Competitive Salary</span>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          {actionButton && (
            <div onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
              {actionButton}
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
            <Clock size={13} style={{ flexShrink: 0 }} />
            <span>{formatTimeAgo(job.created_at || (job as any).createdAt)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
