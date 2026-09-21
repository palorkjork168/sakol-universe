import type { FullProfile } from "../types/profile";

export interface ProfileCompletionResult {
  percentage: number;
  completedCount: number;
  totalCount: number;
  missingItems: { key: string; label: string; action: string }[];
}

export function calculateProfileCompletion(profile?: FullProfile | null): ProfileCompletionResult {
  if (!profile) {
    return {
      percentage: 0,
      completedCount: 0,
      totalCount: 8,
      missingItems: [
        { key: "basic", label: "Basic details", action: "Add your contact information" },
        { key: "title", label: "Professional Title", action: "Add a professional headline" },
        { key: "bio", label: "Personal Bio", action: "Write a brief summary of your expertise" },
        { key: "avatar", label: "Profile Photo", action: "Upload an avatar picture" },
        { key: "resume", label: "CV / Resume", action: "Upload your PDF resume" },
        { key: "skills", label: "Technical Skills", action: "Add at least one key skill" },
        { key: "education", label: "Education History", action: "Add your educational background" },
        { key: "experience", label: "Work Experience", action: "Add your previous work experience" },
      ],
    };
  }

  const p = profile.UserProfile;
  const eduList = profile.Education || profile.Educations || [];
  const expList = profile.Experiences || [];
  const skillList = profile.UserSkills || [];

  const checks = [
    {
      key: "basic",
      label: "Basic Details",
      action: "Add city and contact details",
      completed: Boolean(profile.first_name && profile.last_name && (p?.city || p?.phone)),
    },
    {
      key: "title",
      label: "Professional Title",
      action: "Add your professional title (e.g. Frontend Developer)",
      completed: Boolean(p?.professional_title?.trim()),
    },
    {
      key: "bio",
      label: "Personal Bio",
      action: "Write a short summary about yourself",
      completed: Boolean(p?.bio?.trim()),
    },
    {
      key: "avatar",
      label: "Profile Picture",
      action: "Upload a friendly profile picture",
      completed: Boolean(p?.avatar_url),
    },
    {
      key: "resume",
      label: "PDF Resume",
      action: "Upload your resume in PDF format",
      completed: Boolean(p?.resume_url),
    },
    {
      key: "skills",
      label: "Skills",
      action: "Add your top skills and proficiency levels",
      completed: skillList.length > 0,
    },
    {
      key: "education",
      label: "Education",
      action: "Add your degree or educational credentials",
      completed: eduList.length > 0,
    },
    {
      key: "experience",
      label: "Work Experience",
      action: "Add your employment history",
      completed: expList.length > 0,
    },
  ];

  const completedCount = checks.filter((c) => c.completed).length;
  const totalCount = checks.length;
  const percentage = Math.round((completedCount / totalCount) * 100);
  const missingItems = checks
    .filter((c) => !c.completed)
    .map((c) => ({ key: c.key, label: c.label, action: c.action }));

  return {
    percentage,
    completedCount,
    totalCount,
    missingItems,
  };
}
