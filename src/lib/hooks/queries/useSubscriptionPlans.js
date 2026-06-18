import { useQuery } from "@tanstack/react-query";
import axios from "../../../axios";

const fetchSubscriptionPlans = async () => {
  const { data } = await axios.get(`/subscriptions/plans`);
  console.log("🚀 ~ fetchSubscriptionPlans ~ data:", data);
  return data;
};

export const useGetSubscriptionPlans = () => {
  return useQuery({
    queryKey: ["subscription-plans"],
    queryFn: fetchSubscriptionPlans,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
};
