import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/axios";

// ─── Create Shift ───────────────────────────────────────────────────────────
const createShift = async (data) => {
  const payload = {
    role: data.role,
    startDateTime: data.startDateTime,
    endDateTime: data.endDateTime,
    bartenderIds: data.bartenderIds,
    instructions: data.instructions,
    status: data.status,
  };

  if (data.referenceId) {
    payload.referenceId = data.referenceId;
    payload.referenceType = data.referenceType || "Event";
  }

  const response = await axiosInstance.post("/shifts", payload);
  return response.data;
};

export const useCreateShift = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createShift,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shifts-list"] });
    },
  });
};

// ─── Update Shift ───────────────────────────────────────────────────────────
const updateShift = async ({ id, ...data }) => {
  const payload = {
    role: data.role,
    startDateTime: data.startDateTime,
    endDateTime: data.endDateTime,
    bartenderIds: data.bartenderIds,
    instructions: data.instructions,
    status: data.status,
  };

  if (data.referenceId) {
    payload.referenceId = data.referenceId;
    payload.referenceType = data.referenceType || "Event";
  }

  const response = await axiosInstance.patch(`/shifts/${id}`, payload);
  return response.data;
};

export const useUpdateShift = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateShift,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shifts-list"] });
      queryClient.invalidateQueries({ queryKey: ["shift-detail"] });
    },
  });
};

// ─── Delete Shift ───────────────────────────────────────────────────────────
const deleteShift = async (id) => {
  const response = await axiosInstance.delete(`/shifts/${id}`);
  return response.data;
};

export const useDeleteShift = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteShift,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shifts-list"] });
    },
  });
};
