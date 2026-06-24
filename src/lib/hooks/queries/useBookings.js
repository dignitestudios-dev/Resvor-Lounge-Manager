import { useQuery } from "@tanstack/react-query";
import axios from "../../../axios";

// status = "pending"
// &status=${status}
const fetchBookings = async (page = 1, limit = 10, startDate, endDate, status) => {
  let url = `/bookings/lounge?page=${page}&limit=${limit}`;
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
  console.log("🚀 ~ fetchBookings ~ data:", data);
  return data;
};

// status = "pending"
export const useGetBookings = (page = 1, limit = 10, startDate, endDate, status) => {
  return useQuery({
    queryKey: ["bookings-list", page, limit, startDate, endDate, status],
    queryFn: () => fetchBookings(page, limit, startDate, endDate, status),
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
};
