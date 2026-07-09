import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/axios";

// ─── Get All Bartenders ──────────────────────────────────────────────────────
const fetchBartenders = async ({ page = 1, limit = 10 } = {}) => {
  const { data } = await axiosInstance.get("/bartenders", {
    params: { page, limit },
  });
  return {
    data: data?.data || [],
    pagination: data?.pagination || null,
  };
};

export const useGetBartenders = ({ page = 1, limit = 10 } = {}) => {
  return useQuery({
    queryKey: ["bartenders-list", page, limit],
    queryFn: () => fetchBartenders({ page, limit }),
    keepPreviousData: true,
  });
};

// ─── Get Single Bartender ────────────────────────────────────────────────────
const fetchBartenderById = async (id) => {
  const { data } = await axiosInstance.get(`/bartenders/${id}`);
  return data?.data || data;
};

export const useGetBartenderById = (id) => {
  return useQuery({
    queryKey: ["bartender-detail", id],
    queryFn: () => fetchBartenderById(id),
    enabled: !!id,
  });
};
