import type { Job } from "./job";

export type InterviewType = "IN_PERSON" | "VIDEO" | "PHONE";
export type InterviewStatus = "SCHEDULED" | "COMPLETED" | "CANCELLED";

export interface Interview {
  id: string;
  application_id: string;
  scheduled_at: string;
  duration_minutes: number;
  interview_type: InterviewType;
  location?: string | null;
  meeting_link?: string | null;
  notes?: string | null;
  status: InterviewStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
  creator?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  } | null;
  application?: {
    id: string;
    job_id: string;
    user_id: string;
    status: string;
    Job?: Job;
    applicant?: {
      id: string;
      first_name: string;
      last_name: string;
      email: string;
      UserProfile?: {
        professional_title?: string | null;
        phone?: string | null;
        avatar_url?: string | null;
        resume_url?: string | null;
      } | null;
    } | null;
  } | null;
}

export interface CreateInterviewPayload {
  application_id: string;
  scheduled_at: string;
  duration_minutes?: number;
  interview_type: InterviewType;
  location?: string;
  meeting_link?: string;
  notes?: string;
}

export interface UpdateInterviewPayload {
  scheduled_at?: string;
  duration_minutes?: number;
  interview_type?: InterviewType;
  location?: string;
  meeting_link?: string;
  notes?: string;
}

export interface GetInterviewsResponse {
  success: boolean;
  data: {
    interviews: Interview[];
  };
}

export interface GetInterviewResponse {
  success: boolean;
  data: {
    interview: Interview;
  };
}
