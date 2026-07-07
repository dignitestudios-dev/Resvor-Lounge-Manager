import { useQuery } from "@tanstack/react-query";
import { getServices } from "../api/Get";

export const useServices = (page = 1) => {
  return useQuery({
    queryKey: ["services", page],
    queryFn: () => getServices(page),
  });
};