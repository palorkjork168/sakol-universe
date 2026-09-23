import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../../services/api";
import type { GetJobsResponse, Job } from "../../types/job";
import JobCard from "../../components/public/JobCard";
import EmptyState from "../../components/common/EmptyState";
import {
  Search,
  MapPin,
  ArrowRight,
  Sparkles,
  Building2,
  Users2,
  CheckCircle2,
  Briefcase,
  AlertCircle,
  TrendingUp,
} from "lucide-react";

export default function Home() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [locationTerm, setLocationTerm] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm.trim()) {
      params.set("search", searchTerm.trim());
    }
    if (locationTerm.trim()) {
      params.set("location", locationTerm.trim());
    }
    navigate(`/jobs?${params.toString()}`);
  };

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["featured-jobs"],
    queryFn: async () => {
      const response = await api.get<GetJobsResponse>("/jobs", {
        params: {
          limit: 6,
          sort_by: "created_at",
          sort_order: "desc",
        },
      });
      return response.data.data.jobs;
    },
  });

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">
            <Sparkles size={14} />
            <span>Connecting Talent with Opportunity in Cambodia & Beyond</span>
          </div>

          <h1 className="hero-headline">
            Find Your Opportunity. <br />
            <span className="hero-gradient-text">Build Your Future.</span>
          </h1>

          <p className="hero-subheadline">
            Discover verified careers at leading companies. Search hundreds of engineering, tech, finance, and creative roles on Sakol Universe.
          </p>

          {/* Unified Search Bar */}
          <div className="hero-search-card">
            <form onSubmit={handleSearch} className="hero-search-form">
              <div className="search-field-wrapper">
                <Search size={18} style={{ color: "var(--text-light)" }} />
                <input
                  type="text"
                  className="search-field-input"
                  placeholder="Job title, keywords, or company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="search-field-wrapper">
                <MapPin size={18} style={{ color: "var(--text-light)" }} />
                <input
                  type="text"
                  className="search-field-input"
                  placeholder="City, region, or 'Remote'..."
                  value={locationTerm}
                  onChange={(e) => setLocationTerm(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ padding: "0.75rem 1.75rem" }}>
                Search Jobs
              </button>
            </form>
          </div>

          {/* Trending Searches */}
          <div className="trending-searches">
            <span>Popular:</span>
            <Link to="/jobs?search=Software" className="trending-pill">Software</Link>
            <Link to="/jobs?search=Engineering" className="trending-pill">Engineering</Link>
            <Link to="/jobs?is_remote=true" className="trending-pill">Remote</Link>
            <Link to="/jobs?employment_type=FULL_TIME" className="trending-pill">Full-Time</Link>
            <Link to="/jobs?location=Phnom+Penh" className="trending-pill">Phnom Penh</Link>
          </div>

          {/* Stats Bar */}
          <div className="stats-banner">
            <div className="stat-item">
              <div className="stat-icon">
                <Briefcase size={22} />
              </div>
              <div>
                <div className="stat-number">500+</div>
                <div className="stat-label">Active Job Openings</div>
              </div>
            </div>

            <div className="stat-item">
              <div className="stat-icon" style={{ backgroundColor: "var(--success-bg)", color: "var(--success)" }}>
                <Building2 size={22} />
              </div>
              <div>
                <div className="stat-number">120+</div>
                <div className="stat-label">Verified Employers</div>
              </div>
            </div>

            <div className="stat-item">
              <div className="stat-icon" style={{ backgroundColor: "#f3e8ff", color: "#9333ea" }}>
                <Users2 size={22} />
              </div>
              <div>
                <div className="stat-number">10k+</div>
                <div className="stat-label">Talented Job Seekers</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured / Latest Jobs */}
      <section className="public-container">
        <div className="section-header">
          <div>
            <h2 className="section-title">Latest Opportunities</h2>
            <p className="section-subtitle">
              Explore freshly posted roles from companies actively hiring today
            </p>
          </div>
          <Link to="/jobs" className="btn btn-secondary" style={{ gap: "0.375rem" }}>
            View All Jobs <ArrowRight size={16} />
          </Link>
        </div>

        {isLoading ? (
          <div className="jobs-grid">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="job-card">
                <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
                  <div className="skeleton" style={{ width: "48px", height: "48px", borderRadius: "var(--radius-md)" }} />
                  <div style={{ flex: 1 }}>
                    <div className="skeleton" style={{ height: "20px", width: "70%", marginBottom: "0.5rem" }} />
                    <div className="skeleton" style={{ height: "14px", width: "40%" }} />
                  </div>
                </div>
                <div className="skeleton" style={{ height: "16px", width: "50%", marginBottom: "1rem" }} />
                <div className="skeleton" style={{ height: "40px", width: "100%", marginBottom: "1rem" }} />
                <div className="skeleton" style={{ height: "20px", width: "30%" }} />
              </div>
            ))}
          </div>
        ) : isError ? (
          <EmptyState
            icon={AlertCircle}
            title="Unable to load latest jobs"
            description="Please verify your server connection and try again."
            action={{ label: "Try Again", onClick: () => refetch() }}
          />
        ) : !data || data.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="No jobs published yet"
            description="Check back soon as top employers post new opportunities daily."
            action={{ label: "Browse Job Catalog", to: "/jobs" }}
          />
        ) : (
          <div className="jobs-grid">
            {data.map((job: Job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </section>

      {/* Value Proposition / Benefits */}
      <section style={{ backgroundColor: "#ffffff", borderTop: "1px solid var(--border-color)", borderBottom: "1px solid var(--border-color)", padding: "4.5rem 1.5rem" }}>
        <div style={{ maxWidth: "1120px", margin: "0 auto", textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "var(--primary)", fontWeight: 600, fontSize: "0.875rem", marginBottom: "0.75rem" }}>
            <TrendingUp size={16} /> Why Sakol Universe
          </div>
          <h2 style={{ fontSize: "2.25rem", fontWeight: 700, margin: "0 0 1rem 0" }}>
            Built for Modern Careers & Fast Hiring
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "1.125rem", maxWidth: "600px", margin: "0 auto 3rem" }}>
            We bridge the gap between ambitious professionals and top tier organizations with transparency and speed.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem", textAlign: "left" }}>
            <div className="card" style={{ padding: "2rem" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "8px", backgroundColor: "var(--primary-bg)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.25rem" }}>
                <CheckCircle2 size={22} />
              </div>
              <h3 style={{ fontSize: "1.25rem", margin: "0 0 0.5rem 0" }}>Verified Opportunities</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9375rem", lineHeight: 1.6 }}>
                Every employer and listing is thoroughly vetted so you can apply with full trust and confidence.
              </p>
            </div>

            <div className="card" style={{ padding: "2rem" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "8px", backgroundColor: "var(--success-bg)", color: "var(--success)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.25rem" }}>
                <Sparkles size={22} />
              </div>
              <h3 style={{ fontSize: "1.25rem", margin: "0 0 0.5rem 0" }}>Skill-Based Matching</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9375rem", lineHeight: 1.6 }}>
                Find jobs tailored precisely to your specific technical skills, experience level, and preferred workplace culture.
              </p>
            </div>

            <div className="card" style={{ padding: "2rem" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "8px", backgroundColor: "#f3e8ff", color: "#9333ea", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.25rem" }}>
                <Users2 size={22} />
              </div>
              <h3 style={{ fontSize: "1.25rem", margin: "0 0 0.5rem 0" }}>Seamless Applications</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9375rem", lineHeight: 1.6 }}>
                Save jobs to revisit anytime and apply with just one click using your Sakol Universe professional profile.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
