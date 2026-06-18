import { useQuery } from "@tanstack/react-query";
import axios from "../../../axios";

const fetchEventDetail = async (eventId) => {
  const { data } = await axios.get(`/events/${eventId}`);
  console.log("🚀 ~ fetchEventDetail ~ data:", data);
  return data?.data || {};
};

export const useGetEventDetail = (eventId) => {
  return useQuery({
    queryKey: ["event-detail", eventId],
    queryFn: () => fetchEventDetail(eventId),
    enabled: !!eventId,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
};
