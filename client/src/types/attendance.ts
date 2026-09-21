export interface Attendance {
  id: string;
  user_id: string;
  check_in_time: string;
  check_in_lat: number;
  check_in_long: number;
  check_out_time: string | null;
  check_out_lat: number | null;
  check_out_long: number | null;
  created_at: string;
  updated_at: string;
}
