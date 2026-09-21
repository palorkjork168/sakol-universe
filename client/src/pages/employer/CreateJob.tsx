import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../services/api";
import type { Company, GetMyCompaniesResponse, EmploymentType, ExperienceLevel } from "../../types/job";
import {
  Building2,
  AlertCircle,
  Loader2,
  ArrowLeft,
} from "lucide-react";

export default function CreateJob() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [companyId, setCompanyId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [responsibilities, setResponsibilities] = useState("");
  const [employmentType, setEmploymentType] = useState<EmploymentType>("FULL_TIME");
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel | "">("MID");
  const [salaryMin, setSalaryMin] = useState<string>("");
  const [salaryMax, setSalaryMax] = useState<string>("");
  const [salaryCurrency, setSalaryCurrency] = useState("USD");
  const [location, setLocation] = useState("");
  const [isRemote, setIsRemote] = useState(false);
  const [applicationDeadline, setApplicationDeadline] = useState("");
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">("PUBLISHED");

  const [formError, setFormError] = useState("");

  const { data: companies, isLoading: loadingCompanies } = useQuery<Company[]>({
    queryKey: ["myCompanies"],
    queryFn: async () => {
      const res = await api.get<GetMyCompaniesResponse>("/companies/my");
      return res.data.data.companies;
    },
  });

  // Auto-select company if only one exists
  useEffect(() => {
    if (companies && companies.length === 1 && !companyId) {
      setCompanyId(companies[0].id);
      if (companies[0].city) {
        setLocation(companies[0].city);
      }
    }
  }, [companies, companyId]);

  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.post("/jobs", payload);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["myJobs"] });
      queryClient.invalidateQueries({ queryKey: ["employerDashboard"] });
      const createdJobId = data.data?.job?.id;
      if (createdJobId) {
        navigate(`/employer/jobs/${createdJobId}/edit?created=true`);
      } else {
        navigate("/employer/jobs");
      }
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.message || "Failed to create job posting");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!companyId) {
      setFormError("Please select an employer company for this job.");
      return;
    }

    if (title.trim().length < 3) {
      setFormError("Job title must be at least 3 characters.");
      return;
    }

    if (description.trim().length < 20) {
      setFormError("Description must be at least 20 characters.");
      return;
    }

    if (location.trim().length < 2) {
      setFormError("Location is required.");
      return;
    }

    const payload: any = {
      company_id: companyId,
      title: title.trim(),
      description: description.trim(),
      requirements: requirements.trim() || undefined,
      responsibilities: responsibilities.trim() || undefined,
      employment_type: employmentType,
      experience_level: experienceLevel || undefined,
      salary_min: salaryMin ? parseFloat(salaryMin) : undefined,
      salary_max: salaryMax ? parseFloat(salaryMax) : undefined,
      salary_currency: salaryCurrency,
      location: location.trim(),
      is_remote: isRemote,
      application_deadline: applicationDeadline ? new Date(applicationDeadline).toISOString() : undefined,
      status: status,
    };

    createMutation.mutate(payload);
  };

  if (loadingCompanies) {
    return (
      <div className="dashboard-container" style={{ textAlign: "center", padding: "4rem 1.5rem" }}>
        <Loader2 className="animate-spin" size={24} style={{ color: "var(--primary)" }} />
        <div style={{ marginTop: "0.5rem", color: "var(--text-muted)", fontSize: "0.875rem" }}>
          Loading company details...
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div style={{ marginBottom: "1.5rem" }}>
        <Link
          to="/employer/jobs"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.35rem",
            color: "var(--text-muted)",
            fontSize: "0.8125rem",
            textDecoration: "none",
            marginBottom: "0.75rem",
          }}
        >
          <ArrowLeft size={14} />
          <span>Back to My Jobs</span>
        </Link>
        <h1 className="dashboard-title">Post a New Job</h1>
        <p className="dashboard-subtitle">
          Define candidate criteria, compensation, and responsibilities for your opening
        </p>
      </div>

      {/* No Company Warning */}
      {!companies || companies.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "3rem 1.5rem" }}>
          <Building2 size={36} style={{ color: "var(--text-light)", marginBottom: "0.5rem" }} />
          <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.125rem" }}>No Registered Company Found</h3>
          <p style={{ margin: "0 0 1.25rem 0", color: "var(--text-muted)", maxWidth: "420px", fontSize: "0.875rem" }}>
            You must register your company profile before publishing jobs on the platform.
          </p>
          <Link to="/employer/company" className="btn btn-primary">
            Register Company Profile
          </Link>
        </div>
      ) : (
        <div className="card" style={{ maxWidth: "860px" }}>
          {formError && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.875rem 1rem",
                backgroundColor: "var(--danger-bg)",
                color: "var(--danger-text)",
                borderRadius: "var(--radius-md)",
                fontSize: "0.875rem",
                marginBottom: "1.5rem",
              }}
            >
              <AlertCircle size={18} />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Company Selection */}
            <div className="form-group" style={{ marginBottom: "1.25rem" }}>
              <label className="form-label">
                Hiring Company <span className="required">*</span>
              </label>
              <select
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                className="input-field"
                style={{ width: "100%" }}
                required
              >
                <option value="">-- Select Company --</option>
                {companies.map((comp) => (
                  <option key={comp.id} value={comp.id}>
                    {comp.name} {comp.industry ? `(${comp.industry})` : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Job Title */}
            <div className="form-group" style={{ marginBottom: "1.25rem" }}>
              <label className="form-label">
                Job Title <span className="required">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Senior Full Stack Engineer, Product Designer"
                className="input-field"
                style={{ width: "100%" }}
                required
              />
            </div>

            {/* Employment Type & Experience Level */}
            <div className="form-grid two-cols" style={{ marginBottom: "1.25rem" }}>
              <div className="form-group">
                <label className="form-label">
                  Employment Type <span className="required">*</span>
                </label>
                <select
                  value={employmentType}
                  onChange={(e) => setEmploymentType(e.target.value as EmploymentType)}
                  className="input-field"
                  style={{ width: "100%" }}
                >
                  <option value="FULL_TIME">Full-Time</option>
                  <option value="PART_TIME">Part-Time</option>
                  <option value="CONTRACT">Contract</option>
                  <option value="INTERNSHIP">Internship</option>
                  <option value="FREELANCE">Freelance</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Experience Level</label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value as ExperienceLevel)}
                  className="input-field"
                  style={{ width: "100%" }}
                >
                  <option value="">Any Experience Level</option>
                  <option value="ENTRY">Entry Level</option>
                  <option value="JUNIOR">Junior</option>
                  <option value="MID">Mid Level</option>
                  <option value="SENIOR">Senior</option>
                  <option value="LEAD">Lead / Manager</option>
                </select>
              </div>
            </div>

            {/* Location & Remote */}
            <div className="form-grid two-cols" style={{ marginBottom: "1.25rem" }}>
              <div className="form-group">
                <label className="form-label">
                  Location (City / Country) <span className="required">*</span>
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Phnom Penh, Cambodia"
                  className="input-field"
                  style={{ width: "100%" }}
                  required
                />
              </div>

              <div className="form-group" style={{ display: "flex", alignItems: "center", paddingTop: "1.8rem" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={isRemote}
                    onChange={(e) => setIsRemote(e.target.checked)}
                  />
                  <span style={{ fontWeight: 500 }}>Remote-friendly position</span>
                </label>
              </div>
            </div>

            {/* Salary Range */}
            <div className="form-grid three-cols" style={{ marginBottom: "1.25rem", gridTemplateColumns: "1fr 1fr 120px" }}>
              <div className="form-group">
                <label className="form-label">Salary Minimum (Optional)</label>
                <input
                  type="number"
                  min="0"
                  value={salaryMin}
                  onChange={(e) => setSalaryMin(e.target.value)}
                  placeholder="e.g. 800"
                  className="input-field"
                  style={{ width: "100%" }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Salary Maximum (Optional)</label>
                <input
                  type="number"
                  min="0"
                  value={salaryMax}
                  onChange={(e) => setSalaryMax(e.target.value)}
                  placeholder="e.g. 1500"
                  className="input-field"
                  style={{ width: "100%" }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Currency</label>
                <input
                  type="text"
                  value={salaryCurrency}
                  onChange={(e) => setSalaryCurrency(e.target.value)}
                  className="input-field"
                  style={{ width: "100%" }}
                />
              </div>
            </div>

            {/* Application Deadline & Initial Status */}
            <div className="form-grid two-cols" style={{ marginBottom: "1.25rem" }}>
              <div className="form-group">
                <label className="form-label">Application Deadline (Optional)</label>
                <input
                  type="date"
                  value={applicationDeadline}
                  onChange={(e) => setApplicationDeadline(e.target.value)}
                  className="input-field"
                  style={{ width: "100%" }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Initial Publishing Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as "DRAFT" | "PUBLISHED")}
                  className="input-field"
                  style={{ width: "100%" }}
                >
                  <option value="PUBLISHED">Published (Visible on Portal)</option>
                  <option value="DRAFT">Draft (Save privately)</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div className="form-group" style={{ marginBottom: "1.25rem" }}>
              <label className="form-label">
                Job Overview / Description <span className="required">* (min 20 chars)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the opportunity, core mission, and team structure..."
                className="input-field"
                rows={5}
                style={{ width: "100%", resize: "vertical" }}
                required
              />
            </div>

            {/* Responsibilities */}
            <div className="form-group" style={{ marginBottom: "1.25rem" }}>
              <label className="form-label">Key Responsibilities (Optional)</label>
              <textarea
                value={responsibilities}
                onChange={(e) => setResponsibilities(e.target.value)}
                placeholder="List day-to-day deliverables and key duties..."
                className="input-field"
                rows={4}
                style={{ width: "100%", resize: "vertical" }}
              />
            </div>

            {/* Requirements */}
            <div className="form-group" style={{ marginBottom: "1.5rem" }}>
              <label className="form-label">Requirements & Qualifications (Optional)</label>
              <textarea
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                placeholder="List required technical experience, educational background, or soft skills..."
                className="input-field"
                rows={4}
                style={{ width: "100%", resize: "vertical" }}
              />
            </div>

            {/* Submit */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
              <button
                type="button"
                onClick={() => navigate("/employer/jobs")}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="btn btn-primary"
                style={{ minWidth: "140px" }}
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="animate-spin" size={15} /> Creating...
                  </>
                ) : (
                  "Create Job"
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
