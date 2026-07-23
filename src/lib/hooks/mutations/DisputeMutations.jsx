import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/axios";

const appealDispute = async ({ disputeId, formData }) => {
  const response = await axiosInstance.post(
    `/disputes/${disputeId}/appeal`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};

export const useAppealDispute = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: appealDispute,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["booking-detail"] });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
};
