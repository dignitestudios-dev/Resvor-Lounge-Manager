import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "../../../axios";

const fetchAuthMe = async () => {
  const { data } = await axios.get("/auth/me");
  return data?.data || null;
};

export const useAuthMe = (options = {}) => {
  return useQuery({
    queryKey: ["auth-me"],
    queryFn: fetchAuthMe,
    retry: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
    gcTime: Infinity,
    ...options,
  });
};
