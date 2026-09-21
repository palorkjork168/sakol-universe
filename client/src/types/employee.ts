export interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string | null;
  avatar_url?: string | null;
  status: string;
  created_at: string;
  Roles?: { name: string }[];
  employeeProfile?: {
    id?: string;
    department?: string | null;
    joined_date?: string;
  } | null;
}
