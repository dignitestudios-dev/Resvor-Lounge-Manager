import { useQuery } from "@tanstack/react-query";
import axios from "../../../axios";

const fetchAuthMe = async () => {
  const { data } = await axios.get(`/auth/me?t=${Date.now()}`, {
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
    },
  });
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
