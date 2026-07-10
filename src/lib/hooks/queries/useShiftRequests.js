import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/axios";

// ─── Get Shift Requests ──────────────────────────────────────────────────────
const fetchShiftRequests = async ({ page = 1, limit = 10 } = {}) => {
  const { data } = await axiosInstance.get("/shift-requests", {
    params: { page, limit },
  });
  return {
    data: data?.data || [],
    pagination: data?.pagination || null,
  };
};

export const useGetShiftRequests = ({ page = 1, limit = 10 } = {}) => {
  return useQuery({
    queryKey: ["shift-requests-list", page, limit],
    queryFn: () => fetchShiftRequests({ page, limit }),
    placeholderData: (prev) => prev,
  });
};
