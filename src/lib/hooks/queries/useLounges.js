import { useQuery } from "@tanstack/react-query";
import axios from "../../../axios";

const fetchLounges = async () => {
  const { data } = await axios.get("/lounges/list");
  return data?.data || [];
};

export const useGetLounges = () => {
  return useQuery({
    queryKey: ["lounges-list"],
    queryFn: fetchLounges,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
};
