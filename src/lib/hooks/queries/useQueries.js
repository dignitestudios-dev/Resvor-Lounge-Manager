import { useQuery } from "@tanstack/react-query";
import axios from "../../../axios";

const fetchAuthMe = async () => {
  const { data } = await axios.get("/auth/me");
  console.log("🚀 ~ fetchAuthMe ~ data:", data);
  return data?.data;
};

export const useAuthMe = () => {
  return useQuery({
    queryKey: ["auth-me"],
    queryFn: fetchAuthMe,
    // retry: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
};
