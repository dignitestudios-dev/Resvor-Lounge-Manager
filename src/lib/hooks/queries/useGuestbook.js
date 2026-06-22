import { useQuery } from "@tanstack/react-query";
import axios from "../../../axios";

const fetchGuestbook = async ({ page = 1, startDate = "", endDate = "" }) => {
  const params = { page };

  // Only add date filters when they are actually selected
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;

  const { data } = await axios.get("/guestbook", { params });
  // Return both the array and pagination meta
  return {
    data: data?.data || [],
    pagination: data?.pagination || null,
  };
};

export const useGetGuestbook = ({ page = 1, startDate = "", endDate = "" } = {}) => {
  return useQuery({
    queryKey: ["guestbook-list", page, startDate, endDate],
    queryFn: () => fetchGuestbook({ page, startDate, endDate }),
    keepPreviousData: true,
  });
};
