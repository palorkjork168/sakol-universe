import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../services/api";
import type { NotificationListResponse } from "../types/notification";

interface UseNotificationsParams {
  page?: number;
  limit?: number;
  is_read?: boolean | string;
  type?: string;
}

export function useUnreadCount(enabled: boolean = true) {
  return useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: async () => {
      const response = await api.get("/notifications/unread-count");
      return (response.data.data.unreadCount ?? 0) as number;
    },
    enabled,
    refetchInterval: 30000, // Refetch every 30 seconds
    refetchOnWindowFocus: true,
  });
}

export function useNotifications(
  params: UseNotificationsParams = {},
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ["notifications", "list", params],
    queryFn: async () => {
      const response = await api.get("/notifications", { params });
      return response.data.data as NotificationListResponse;
    },
    enabled,
    staleTime: 10000,
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await api.patch(`/notifications/${notificationId}/read`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await api.patch("/notifications/read-all");
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
