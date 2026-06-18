import { useQuery } from "@tanstack/react-query";
import axios from "../../../axios";

// status = "pending"
// &status=${status}
const fetchBookings = async (page = 1, limit = 10) => {
  const { data } = await axios.get(
    `/bookings/lounge?page=${page}&limit=${limit}`,
  );
  console.log("🚀 ~ fetchBookings ~ data:", data);
  return data;
};

// status = "pending"
export const useGetBookings = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: ["bookings-list", page, limit],
    queryFn: () => fetchBookings(page, limit),
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
};
