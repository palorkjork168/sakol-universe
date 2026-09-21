export type EmploymentType =
  | "FULL_TIME"
  | "PART_TIME"
  | "INTERNSHIP"
  | "CONTRACT"
  | "FREELANCE";

export type ExperienceLevel =
  | "ENTRY"
  | "JUNIOR"
  | "MID"
  | "SENIOR"
  | "LEAD";

export type CompanySize = "1-10" | "11-50" | "51-200" | "201-500" | "500+";
export type CompanyStatus = "PENDING" | "ACTIVE" | "SUSPENDED";

export interface Company {
  id: string;
  owner_id?: string;
  name: string;
  logo_url?: string | null;
  description?: string | null;
  website?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  industry?: string | null;
  company_size?: CompanySize | null;
  status?: CompanyStatus;
  created_at?: string;
  updated_at?: string;
}

export interface Job {
  id: string;
  company_id: string;
  title: string;
  description: string;
  requirements?: string | null;
  responsibilities?: string | null;
  employment_type: EmploymentType;
  experience_level?: ExperienceLevel | null;
  salary_min?: number | null;
  salary_max?: number | null;
  salary_currency?: string | null;
  location: string;
  is_remote: boolean;
  application_deadline?: string | null;
  status: "DRAFT" | "PUBLISHED" | "CLOSED";
  created_at: string;
  updated_at: string;
  Company?: Company | null;
  Applications?: { id: string; status: string }[];
}

export interface JobSkill {
  id: string;
  job_id: string;
  skill_name: string;
  is_required: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GetJobsResponse {
  success: boolean;
  data: {
    jobs: Job[];
    pagination: PaginationMeta;
  };
}

export interface GetJobResponse {
  success: boolean;
  data: {
    job: Job;
  };
}

export interface GetMyJobsResponse {
  success: boolean;
  data: {
    jobs: Job[];
  };
}

export interface GetMyCompaniesResponse {
  success: boolean;
  data: {
    companies: Company[];
  };
}

export interface GetCompanyResponse {
  success: boolean;
  data: {
    company: Company;
  };
}

export interface GetJobSkillsResponse {
  success: boolean;
  data: {
    skills: JobSkill[];
  };
}

export interface JobFilters {
  search?: string;
  location?: string;
  employment_type?: EmploymentType | "";
  experience_level?: ExperienceLevel | "";
  is_remote?: "true" | "false" | "";
  industry?: string;
  salary_min?: string;
  salary_max?: string;
  date_posted?: "today" | "week" | "month" | "";
  sort_by?: "created_at" | "salary_min" | "salary_max";
  sort_order?: "asc" | "desc";
  page?: number;
  limit?: number;
}
