import { useQuery } from "@tanstack/react-query";
import axios from "../../../axios";

const fetchGuestbook = async ({
  page = 1,
  search = "",
  startDate = "",
  endDate = "",
  limit = 10,
}) => {
  const params = { page, limit };

  if (search.trim()) params.search = search.trim();
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;

  const { data } = await axios.get("/guestbook", { params });

  return {
    data: data?.data || [],
    pagination: data?.pagination || null,
  };
};

export const useGetGuestbook = ({
  page = 1,
  search = "",
  startDate = "",
  endDate = "",
  limit = 10,
} = {}) => {
  return useQuery({
    queryKey: ["guestbook-list", page, search, startDate, endDate, limit],
    queryFn: () =>
      fetchGuestbook({ page, search, startDate, endDate, limit }),
    keepPreviousData: true,
  });
};