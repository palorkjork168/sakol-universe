import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../services/api";
import type { FullProfile, GetProfileResponse } from "../../types/profile";
import { calculateProfileCompletion } from "../../utils/profileCompletion";
import SkillsSection from "../../components/job-seeker/SkillsSection";
import EducationSection from "../../components/job-seeker/EducationSection";
import ExperienceSection from "../../components/job-seeker/ExperienceSection";
import {
  Mail,
  Phone,
  MapPin,
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Edit3,
  Sparkles,
  Camera,
  Loader2,
} from "lucide-react";

export default function Profile() {
  const queryClient = useQueryClient();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);

  const [editInfoModalOpen, setEditInfoModalOpen] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const [avatarSuccess, setAvatarSuccess] = useState("");
  const [resumeError, setResumeError] = useState("");
  const [resumeSuccess, setResumeSuccess] = useState("");

  // Edit Personal/Professional Info form states
  const [profTitle, setProfTitle] = useState("");
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [infoError, setInfoError] = useState("");

  // Query profile
  const { data: profile, isLoading, error } = useQuery<FullProfile>({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await api.get<GetProfileResponse>("/profile/me");
      return res.data.data.profile;
    },
  });

  // Open Edit Info Modal
  const openEditInfoModal = () => {
    if (!profile) return;
    const up = profile.UserProfile;
    setProfTitle(up?.professional_title || "");
    setBio(up?.bio || "");
    setPhone(up?.phone || "");
    setAddress(up?.address || "");
    setCity(up?.city || "");
    setCountry(up?.country || "");
    setInfoError("");
    setEditInfoModalOpen(true);
  };

  // Update Profile Info Mutation
  const updateInfoMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.put("/profile/me", payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      setEditInfoModalOpen(false);
    },
    onError: (err: any) => {
      setInfoError(err.response?.data?.message || "Failed to update profile information");
    },
  });

  // Avatar Upload Mutation
  const avatarMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("avatar", file);
      const res = await api.post("/profile/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      setAvatarSuccess("Avatar updated successfully!");
      setAvatarError("");
      setTimeout(() => setAvatarSuccess(""), 3500);
    },
    onError: (err: any) => {
      setAvatarError(err.response?.data?.message || err.message || "Failed to upload avatar");
      setAvatarSuccess("");
    },
  });

  // Resume Upload Mutation
  const resumeMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("resume", file);
      const res = await api.post("/profile/resume", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      setResumeSuccess("Resume uploaded successfully!");
      setResumeError("");
      setTimeout(() => setResumeSuccess(""), 3500);
    },
    onError: (err: any) => {
      setResumeError(err.response?.data?.message || err.message || "Failed to upload resume");
      setResumeSuccess("");
    },
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type and size (5MB)
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setAvatarError("Only JPG, PNG and WEBP images are allowed");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError("Avatar image size must be less than 5MB");
      return;
    }

    setAvatarError("");
    avatarMutation.mutate(file);
    e.target.value = "";
  };

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate PDF and size (10MB)
    if (file.type !== "application/pdf") {
      setResumeError("Only PDF files are allowed");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setResumeError("Resume PDF size must be less than 10MB");
      return;
    }

    setResumeError("");
    resumeMutation.mutate(file);
    e.target.value = "";
  };

  const handleInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateInfoMutation.mutate({
      professional_title: profTitle.trim(),
      bio: bio.trim(),
      phone: phone.trim(),
      address: address.trim(),
      city: city.trim(),
      country: country.trim(),
    });
  };

  if (isLoading) {
    return (
      <div className="dashboard-container" style={{ padding: "3rem 1.5rem", textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "var(--text-muted)" }}>
          <Loader2 className="animate-spin" size={20} />
          <span>Loading your profile...</span>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="dashboard-container" style={{ padding: "3rem 1.5rem" }}>
        <div
          style={{
            padding: "1.5rem",
            backgroundColor: "var(--danger-bg)",
            color: "var(--danger-text)",
            borderRadius: "var(--radius-lg)",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
          }}
        >
          <AlertCircle size={20} />
          <span>Failed to load profile. Please try refreshing the page.</span>
        </div>
      </div>
    );
  }

  const completion = calculateProfileCompletion(profile);
  const up = profile.UserProfile;
  const educations = profile.Education || profile.Educations || [];
  const experiences = profile.Experiences || [];
  const skills = profile.UserSkills || [];

  const getInitials = (first?: string, last?: string) => {
    if (!first) return "JS";
    return `${first.charAt(0)}${last ? last.charAt(0) : ""}`.toUpperCase();
  };

  return (
    <div className="dashboard-container">
      {/* Profile Completion Card */}
      <div
        className="card"
        style={{
          marginBottom: "1.5rem",
          background: "linear-gradient(135deg, #2563eb0a 0%, #3b82f615 100%)",
          borderColor: "rgba(37, 99, 235, 0.2)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", marginBottom: "0.75rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
            <Sparkles size={20} style={{ color: "var(--primary)" }} />
            <h3 style={{ margin: 0, fontSize: "1.0625rem", fontWeight: 600, color: "var(--text-main)" }}>
              Profile Strength: {completion.percentage}%
            </h3>
          </div>
          <span style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
            {completion.completedCount} of {completion.totalCount} sections complete
          </span>
        </div>

        {/* Progress Bar */}
        <div
          style={{
            height: "8px",
            backgroundColor: "rgba(0, 0, 0, 0.06)",
            borderRadius: "9999px",
            overflow: "hidden",
            marginBottom: completion.missingItems.length > 0 ? "0.875rem" : "0",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${completion.percentage}%`,
              backgroundColor: completion.percentage >= 80 ? "#10b981" : "var(--primary)",
              borderRadius: "9999px",
              transition: "width 0.4s ease",
            }}
          />
        </div>

        {completion.missingItems.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", fontSize: "0.8125rem" }}>
            <span style={{ color: "var(--text-muted)", fontWeight: 500 }}>Next steps:</span>
            {completion.missingItems.slice(0, 3).map((item) => (
              <span
                key={item.key}
                style={{
                  backgroundColor: "var(--surface)",
                  padding: "0.2rem 0.6rem",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border-color)",
                  color: "var(--text-main)",
                  fontSize: "0.75rem",
                }}
              >
                + {item.action}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Main Profile Header Card */}
      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "1.5rem" }}>
          {/* Avatar and Info */}
          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap" }}>
            {/* Avatar with upload trigger */}
            <div style={{ position: "relative" }}>
              <div
                style={{
                  width: "90px",
                  height: "90px",
                  borderRadius: "50%",
                  backgroundColor: "var(--primary-bg)",
                  color: "var(--primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "2rem",
                  fontWeight: 700,
                  overflow: "hidden",
                  border: "3px solid var(--surface)",
                  boxShadow: "var(--shadow-md)",
                }}
              >
                {up?.avatar_url ? (
                  <img
                    src={up.avatar_url}
                    alt={`${profile.first_name} ${profile.last_name}`}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  getInitials(profile.first_name, profile.last_name)
                )}
              </div>

              {/* Upload avatar overlay button */}
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                disabled={avatarMutation.isPending}
                style={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  backgroundColor: "var(--primary)",
                  color: "white",
                  border: "2px solid var(--surface)",
                  borderRadius: "50%",
                  width: "30px",
                  height: "30px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  boxShadow: "var(--shadow-sm)",
                }}
                title="Change profile photo"
              >
                {avatarMutation.isPending ? <Loader2 className="animate-spin" size={14} /> : <Camera size={14} />}
              </button>
              <input
                type="file"
                ref={avatarInputRef}
                onChange={handleAvatarChange}
                accept="image/jpeg,image/png,image/webp"
                style={{ display: "none" }}
              />
            </div>

            {/* Name, Title, and Contact */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <h2 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 700, color: "var(--text-main)" }}>
                  {profile.first_name} {profile.last_name}
                </h2>
              </div>

              <div style={{ fontSize: "1rem", color: "var(--primary)", fontWeight: 500, marginTop: "0.25rem" }}>
                {up?.professional_title || "Job Seeker"}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", flexWrap: "wrap", marginTop: "0.625rem", fontSize: "0.8125rem", color: "var(--text-muted)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                  <Mail size={14} />
                  <span>{profile.email}</span>
                </div>
                {up?.phone && (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                    <Phone size={14} />
                    <span>{up.phone}</span>
                  </div>
                )}
                {(up?.city || up?.country) && (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                    <MapPin size={14} />
                    <span>{[up.city, up.country].filter(Boolean).join(", ")}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Edit Details button */}
          <button onClick={openEditInfoModal} className="btn btn-secondary" style={{ fontSize: "0.8125rem" }}>
            <Edit3 size={15} /> Edit Details
          </button>
        </div>

        {/* Feedback alerts for avatar upload */}
        {avatarSuccess && (
          <div style={{ marginTop: "1rem", display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--success)", fontSize: "0.8125rem" }}>
            <CheckCircle2 size={15} /> {avatarSuccess}
          </div>
        )}
        {avatarError && (
          <div style={{ marginTop: "1rem", display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--danger)", fontSize: "0.8125rem" }}>
            <AlertCircle size={15} /> {avatarError}
          </div>
        )}

        {/* Bio / Summary */}
        {up?.bio && (
          <div style={{ marginTop: "1.25rem", paddingTop: "1.25rem", borderTop: "1px solid var(--border-color)" }}>
            <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "0.875rem", fontWeight: 600, color: "var(--text-muted)" }}>
              ABOUT ME
            </h4>
            <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--text-main)", lineHeight: 1.6, whiteSpace: "pre-line" }}>
              {up.bio}
            </p>
          </div>
        )}
      </div>

      {/* Resume Section Card */}
      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h3 style={{ fontSize: "1.125rem", fontWeight: 600, margin: 0, color: "var(--text-main)" }}>
              CV / Resume
            </h3>
            <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)", margin: "0.25rem 0 0 0" }}>
              PDF format only. Maximum file size 10MB.
            </p>
          </div>

          <div>
            <input
              type="file"
              ref={resumeInputRef}
              onChange={handleResumeChange}
              accept="application/pdf"
              style={{ display: "none" }}
            />
            <button
              onClick={() => resumeInputRef.current?.click()}
              disabled={resumeMutation.isPending}
              className="btn btn-secondary"
              style={{ fontSize: "0.8125rem", padding: "0.4rem 0.75rem" }}
            >
              {resumeMutation.isPending ? (
                <>
                  <Loader2 className="animate-spin" size={15} /> Uploading...
                </>
              ) : (
                <>
                  <Upload size={15} /> {up?.resume_url ? "Replace Resume" : "Upload Resume (PDF)"}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Feedback alerts */}
        {resumeSuccess && (
          <div style={{ marginTop: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--success)", fontSize: "0.8125rem" }}>
            <CheckCircle2 size={15} /> {resumeSuccess}
          </div>
        )}
        {resumeError && (
          <div style={{ marginTop: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--danger)", fontSize: "0.8125rem" }}>
            <AlertCircle size={15} /> {resumeError}
          </div>
        )}

        {/* Resume status display */}
        <div style={{ marginTop: "1rem" }}>
          {up?.resume_url ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0.875rem 1rem",
                backgroundColor: "var(--bg-color)",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-color)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "var(--radius-md)",
                    backgroundColor: "rgba(239, 68, 68, 0.1)",
                    color: "#dc2626",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <FileText size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 500, fontSize: "0.875rem", color: "var(--text-main)" }}>
                    Uploaded Resume (PDF)
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    Ready for job applications
                  </div>
                </div>
              </div>

              <a
                href={up.resume_url}
                target="_blank"
                rel="noreferrer"
                className="btn btn-ghost"
                style={{ fontSize: "0.8125rem", gap: "0.375rem" }}
              >
                <span>View / Download</span>
                <ExternalLink size={13} />
              </a>
            </div>
          ) : (
            <div
              style={{
                textAlign: "center",
                padding: "1.5rem",
                backgroundColor: "var(--bg-color)",
                borderRadius: "var(--radius-md)",
                border: "1px dashed var(--border-color)",
              }}
            >
              <FileText size={28} style={{ color: "var(--text-light)", marginBottom: "0.25rem" }} />
              <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--text-muted)" }}>
                No resume uploaded yet. Having a resume allows 1-click applications!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Skills Section */}
      <SkillsSection skills={skills} />

      {/* Education Section */}
      <EducationSection educations={educations} />

      {/* Experience Section */}
      <ExperienceSection experiences={experiences} />

      {/* Edit Personal & Professional Info Modal */}
      {editInfoModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ margin: 0, fontSize: "1.125rem", fontWeight: 600 }}>
                Edit Personal & Professional Information
              </h3>
              <button onClick={() => setEditInfoModalOpen(false)} className="btn-icon">
                ✕
              </button>
            </div>
            <form onSubmit={handleInfoSubmit}>
              <div className="modal-body">
                {infoError && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.75rem",
                      backgroundColor: "var(--danger-bg)",
                      color: "var(--danger-text)",
                      borderRadius: "var(--radius-md)",
                      fontSize: "0.8125rem",
                      marginBottom: "1rem",
                    }}
                  >
                    <AlertCircle size={16} />
                    <span>{infoError}</span>
                  </div>
                )}

                <div className="form-group" style={{ marginBottom: "1rem" }}>
                  <label className="form-label">Professional Title</label>
                  <input
                    type="text"
                    value={profTitle}
                    onChange={(e) => setProfTitle(e.target.value)}
                    placeholder="e.g. Full Stack Developer, Marketing Specialist"
                    className="input-field"
                    style={{ width: "100%" }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: "1rem" }}>
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +855 12 345 678"
                    className="input-field"
                    style={{ width: "100%" }}
                  />
                </div>

                <div className="form-grid two-cols" style={{ marginBottom: "1rem" }}>
                  <div className="form-group">
                    <label className="form-label">City</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Phnom Penh"
                      className="input-field"
                      style={{ width: "100%" }}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Country</label>
                    <input
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="e.g. Cambodia"
                      className="input-field"
                      style={{ width: "100%" }}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: "1rem" }}>
                  <label className="form-label">Street Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Street 2004, Sen Sok"
                    className="input-field"
                    style={{ width: "100%" }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Bio / Professional Summary</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Share a brief overview of your background, strengths, and what you are looking for..."
                    className="input-field"
                    rows={4}
                    style={{ width: "100%", resize: "vertical" }}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setEditInfoModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateInfoMutation.isPending}
                  className="btn btn-primary"
                >
                  {updateInfoMutation.isPending ? "Saving..." : "Save Information"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
