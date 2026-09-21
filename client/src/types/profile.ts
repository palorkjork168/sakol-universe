import type { Job, Company } from "./job";

export type SkillLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";

export type ApplicationStatus =
  | "PENDING"
  | "REVIEWING"
  | "INTERVIEW"
  | "ACCEPTED"
  | "REJECTED"
  | "WITHDRAWN";

export interface UserProfileData {
  id: string;
  user_id: string;
  professional_title?: string | null;
  bio?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  avatar_url?: string | null;
  avatar_public_id?: string | null;
  resume_url?: string | null;
  resume_public_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface UserSkillItem {
  id: string;
  user_id: string;
  skill_name: string;
  level?: SkillLevel;
  created_at: string;
  updated_at: string;
}

export interface EducationItem {
  id: string;
  user_id: string;
  institution: string;
  degree?: string | null;
  field_of_study?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  is_current: boolean;
  description?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ExperienceItem {
  id: string;
  user_id: string;
  company_name: string;
  position: string;
  employment_type?: "FULL_TIME" | "PART_TIME" | "INTERNSHIP" | "CONTRACT" | "FREELANCE";
  location?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  is_current: boolean;
  description?: string | null;
  created_at: string;
  updated_at: string;
}

export interface FullProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  UserProfile?: UserProfileData | null;
  UserSkills?: UserSkillItem[];
  Education?: EducationItem[];
  Educations?: EducationItem[];
  Experiences?: ExperienceItem[];
}

export interface GetProfileResponse {
  success: boolean;
  data: {
    profile: FullProfile;
  };
}

export interface JobApplicationItem {
  id: string;
  user_id: string;
  job_id: string;
  status: ApplicationStatus;
  cover_letter?: string | null;
  cv_url?: string | null;
  created_at: string;
  updated_at: string;
  Job?: Job & { Company?: Company };
}

export interface GetMyApplicationsResponse {
  success: boolean;
  data: {
    applications: JobApplicationItem[];
  };
}

export interface SavedJobRecord {
  id: string;
  user_id: string;
  job_id: string;
  created_at: string;
  job?: Job & { Company?: Company };
}

export interface GetSavedJobsResponse {
  success: boolean;
  data: {
    savedJobs: SavedJobRecord[];
  };
}

export interface RecommendedJobItem {
  job: Job & { skills?: { skill_name: string }[] };
  match_percentage: number;
}

export interface GetRecommendedJobsResponse {
  success: boolean;
  data: {
    recommendations: RecommendedJobItem[];
  };
}
