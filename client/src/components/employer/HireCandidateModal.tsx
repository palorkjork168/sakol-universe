import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../services/api";
import {
  X,
  UserCheck,
  Building2,
  Briefcase,
  ShieldCheck,
  AlertCircle,
  Loader2,
} from "lucide-react";

interface HireCandidateModalProps {
  applicationId: string;
  candidateName: string;
  candidateEmail: string;
  jobTitle?: string;
  companyName?: string;
  onClose: () => void;
  onHired?: () => void;
}

export default function HireCandidateModal({
  applicationId,
  candidateName,
  candidateEmail,
  jobTitle,
  companyName,
  onClose,
  onHired,
}: HireCandidateModalProps) {
  const queryClient = useQueryClient();
  const [department, setDepartment] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const hireMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post(`/applications/${applicationId}/hire`, {
        department: department.trim() || undefined,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applicantDetails", applicationId] });
      queryClient.invalidateQueries({ queryKey: ["jobApplications"] });
      queryClient.invalidateQueries({ queryKey: ["employerDashboard"] });
      queryClient.invalidateQueries({ queryKey: ["myJobs"] });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      if (onHired) onHired();
      onClose();
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || "Failed to hire candidate");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    hireMutation.mutate();
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 1100 }}>
      <div className="modal-content" style={{ maxWidth: "520px" }}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                backgroundColor: "rgba(16, 185, 129, 0.12)",
                color: "var(--success)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <UserCheck size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.0625rem", fontWeight: 700 }}>
                Hire Candidate
              </h3>
              <p style={{ margin: "0.15rem 0 0 0", fontSize: "0.8125rem", color: "var(--text-muted)" }}>
                Convert accepted candidate to an employee
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn-icon" disabled={hireMutation.isPending}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {errorMsg && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.75rem",
                  backgroundColor: "rgba(239, 68, 68, 0.1)",
                  borderRadius: "var(--radius-sm)",
                  color: "var(--danger)",
                  fontSize: "0.8125rem",
                }}
              >
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Candidate Summary Card */}
            <div
              style={{
                padding: "1rem",
                backgroundColor: "var(--bg-color)",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-color)",
                display: "flex",
                flexDirection: "column",
                gap: "0.6rem",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>
                  Candidate
                </span>
                <span
                  style={{
                    fontSize: "0.6875rem",
                    fontWeight: 600,
                    padding: "0.15rem 0.5rem",
                    borderRadius: "9999px",
                    backgroundColor: "rgba(16, 185, 129, 0.12)",
                    color: "var(--success)",
                  }}
                >
                  ACCEPTED
                </span>
              </div>
              <div style={{ fontSize: "0.9375rem", fontWeight: 700, color: "var(--text-main)" }}>
                {candidateName}
              </div>
              <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
                {candidateEmail}
              </div>

              {(jobTitle || companyName) && (
                <div
                  style={{
                    borderTop: "1px solid var(--border-color)",
                    paddingTop: "0.5rem",
                    marginTop: "0.25rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.25rem",
                    fontSize: "0.75rem",
                    color: "var(--text-muted)",
                  }}
                >
                  {jobTitle && (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                      <Briefcase size={13} style={{ color: "var(--primary)" }} />
                      <span>{jobTitle}</span>
                    </div>
                  )}
                  {companyName && (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                      <Building2 size={13} style={{ color: "var(--primary)" }} />
                      <span>{companyName}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Architectural Guarantee Notice */}
            <div
              style={{
                padding: "0.75rem 1rem",
                backgroundColor: "rgba(37, 99, 235, 0.04)",
                borderRadius: "var(--radius-md)",
                border: "1px solid rgba(37, 99, 235, 0.2)",
                fontSize: "0.8125rem",
                lineHeight: 1.5,
                color: "var(--text-main)",
                display: "flex",
                gap: "0.65rem",
              }}
            >
              <ShieldCheck size={18} style={{ color: "var(--primary)", flexShrink: 0, marginTop: "0.1rem" }} />
              <div>
                <strong>Single Account Architecture:</strong> This candidate's existing Sakol Universe account will receive the <strong>Employee</strong> role alongside their <strong>Job Seeker</strong> role. No duplicate account is created.
              </div>
            </div>

            {/* Department Input */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" htmlFor="department" style={{ fontSize: "0.8125rem" }}>
                Assigned Department (Optional)
              </label>
              <input
                id="department"
                type="text"
                className="form-input"
                placeholder="e.g. Engineering, Product, Marketing"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                maxLength={100}
                disabled={hireMutation.isPending}
              />
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem", display: "block" }}>
                Can be updated later in Employee Management.
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={hireMutation.isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={hireMutation.isPending}
              style={{
                backgroundColor: "var(--success)",
                borderColor: "var(--success)",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
              }}
            >
              {hireMutation.isPending ? (
                <>
                  <Loader2 className="animate-spin" size={15} />
                  <span>Hiring...</span>
                </>
              ) : (
                <>
                  <UserCheck size={15} />
                  <span>Confirm & Hire Candidate</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
