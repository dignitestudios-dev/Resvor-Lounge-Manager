import { useQuery } from "@tanstack/react-query";
import axios from "../../../axios";

const fetchBookingDetail = async (bookingId) => {
  const { data } = await axios.get(`/bookings/${bookingId}`);
  console.log("🚀 ~ fetchBookingDetail ~ data:", data);
  return data?.data || {};
};

export const useGetBookingDetail = (bookingId) => {
  return useQuery({
    queryKey: ["booking-detail", bookingId],
    queryFn: () => fetchBookingDetail(bookingId),
    enabled: !!bookingId,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
};
