import { useQuery } from "@tanstack/react-query";
import axios from "../../../axios";

const fetchEvents = async (page = 1, limit = 10) => {
  const { data } = await axios.get(
    `/events/lounge?page=${page}&limit=${limit}`,
  );
  console.log("🚀 ~ fetchEvents ~ data:", data);
  return data;
};

export const useGetEvents = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: ["events-list", page, limit],
    queryFn: () => fetchEvents(page, limit),
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
};
