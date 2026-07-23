import { useQuery } from "@tanstack/react-query";
import axios from "../../../axios";

const fetchNotifications = async (page = 1, limit = 10) => {
  const { data } = await axios.get("/notifications", {
    params: { page, limit },
  });
  return data;
};

export const useNotifications = (page = 1, limit = 10, options = {}) => {
  return useQuery({
    queryKey: ["notifications", page, limit],
    queryFn: () => fetchNotifications(page, limit),
    retry: false,
    refetchOnWindowFocus: false,
    ...options,
  });
};

export default useNotifications;
