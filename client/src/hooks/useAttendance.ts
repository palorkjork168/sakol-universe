import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../services/api";
import type { Attendance } from "../types/attendance";

export function useMyAttendance(enabled: boolean = true) {
  return useQuery({
    queryKey: ["attendance", "me"],
    queryFn: async () => {
      const response = await api.get("/attendance/me");
      return response.data.data.attendances as Attendance[];
    },
    enabled,
  });
}

export function useCheckIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (coords: { latitude: number; longitude: number }) => {
      const response = await api.post("/attendance/check-in", coords);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance", "me"] });
    },
  });
}

export function useCheckOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (coords: { latitude: number; longitude: number }) => {
      const response = await api.post("/attendance/check-out", coords);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance", "me"] });
    },
  });
}
