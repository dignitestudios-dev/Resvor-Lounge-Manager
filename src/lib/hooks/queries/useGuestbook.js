
import { useQuery } from "@tanstack/react-query";
import axios from "../../../axios";

const fetchGuestbook = async ({
  page = 1,
  search = "",
  startDate = "",
  endDate = "",
  limit = 10,
}) => {
 const params = { page, limit, scope: "manager" };


  if (search.trim()) params.search = search.trim();
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;

  const { data } = await axios.get("/guestbook", { params });

  return {
    data: data?.data || [],
    pagination: data?.pagination || null,
  };
};

const fetchALLGuestbook = async ({
  page = 1,
  search = "",
  startDate = "",
  endDate = "",
  limit = 10,
}) => {
  const params = { page, limit, scope: "all" };

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
    queryKey: ["guestbook-manager", page, search, startDate, endDate, limit],
    queryFn: () =>
      fetchGuestbook({ page, search, startDate, endDate, limit }),
    keepPreviousData: true,
  });
};

export const useGetAllGuestbook = ({
  page = 1,
  search = "",
  startDate = "",
  endDate = "",
  limit = 10,
} = {}) => {
  return useQuery({
    queryKey: ["guestbook-all", page, search, startDate, endDate, limit],
    queryFn: () =>
      fetchALLGuestbook({ page, search, startDate, endDate, limit }),
    keepPreviousData: true,
  });
};

export const fetchGuestById = async (id) => {
  if (!id) return null;
  const { data } = await axios.get(`/guestbook/${id}`);
  return data?.data || data;
};

export const useGetGuestById = (id) => {
  return useQuery({
    queryKey: ["guestbook-detail", id],
    queryFn: () => fetchGuestById(id),
    enabled: Boolean(id),
  });
};
