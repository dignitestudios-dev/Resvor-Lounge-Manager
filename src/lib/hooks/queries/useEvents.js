import { useQuery } from "@tanstack/react-query";
import axios from "../../../axios";

const fetchEvents = async (page = 1, limit = 10, startDate, endDate, status) => {
  let url = `/events/lounge?page=${page}&limit=${limit}`;
  if (startDate) {
    url += `&startDate=${startDate}`;
  }
  if (endDate) {
    url += `&endDate=${endDate}`;
  }
  if (status) {
    url += `&status=${status}`;
  }
  const { data } = await axios.get(url);
  console.log("🚀 ~ fetchEvents ~ data:", data);
  return data;
};

export const useGetEvents = (page = 1, limit = 10, startDate, endDate, status) => {
  return useQuery({
    queryKey: ["events-list", page, limit, startDate, endDate, status],
    queryFn: () => fetchEvents(page, limit, startDate, endDate, status),
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
};
