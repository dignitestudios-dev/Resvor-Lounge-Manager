import { useQuery } from "@tanstack/react-query";
import axios from "../../../axios";

const fetchDashboard = async ({ startDate, endDate } = {}) => {
  const params = new URLSearchParams();
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);

  const queryString = params.toString() ? `?${params.toString()}` : "";
  const { data } = await axios.get(`/dashboard${queryString}`);
  return data?.data || {};
};

export const useGetDashboard = ({ startDate, endDate } = {}, options = {}) => {
  return useQuery({
    queryKey: ["dashboard", startDate, endDate],
    queryFn: () => fetchDashboard({ startDate, endDate }),
    retry: false,
    refetchOnWindowFocus: false,
    ...options,
  });
};
