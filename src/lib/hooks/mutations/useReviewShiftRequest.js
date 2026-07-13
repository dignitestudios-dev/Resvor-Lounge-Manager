import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/axios";

// ─── Review Shift Request ───────────────────────────────────────────────────
const reviewShiftRequest = async ({ id, status, reviewNote }) => {
  const response = await axiosInstance.patch(`/shift-requests/${id}/review`, {
    status,
    reviewNote,
  });
  return response.data;
};

export const useReviewShiftRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reviewShiftRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shift-requests-list"] });
    },
  });
};
