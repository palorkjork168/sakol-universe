import { useQuery } from "@tanstack/react-query";
import api from "../services/api";
import type {
  AdminOverviewData,
  CompanyAnalyticsData,
  EmployeePersonalAnalyticsData,
} from "../types/analytics";

export function useAdminAnalytics(from?: string, to?: string) {
  return useQuery({
    queryKey: ["analytics", "admin", from, to],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (from) params.append("from", from);
      if (to) params.append("to", to);
      const res = await api.get(`/analytics/admin/overview?${params.toString()}`);
      return res.data.data as AdminOverviewData;
    },
    staleTime: 60 * 1000,
  });
}

export function useCompanyAnalytics(companyId?: string, from?: string, to?: string) {
  return useQuery({
    queryKey: ["analytics", "company", companyId, from, to],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (from) params.append("from", from);
      if (to) params.append("to", to);
      const res = await api.get(`/analytics/company/${companyId}/overview?${params.toString()}`);
      return res.data.data as CompanyAnalyticsData;
    },
    enabled: Boolean(companyId),
    staleTime: 60 * 1000,
  });
}

export function usePersonalAnalytics() {
  return useQuery({
    queryKey: ["analytics", "me"],
    queryFn: async () => {
      const res = await api.get("/analytics/me/overview");
      return res.data.data as EmployeePersonalAnalyticsData;
    },
    staleTime: 30 * 1000,
  });
}
