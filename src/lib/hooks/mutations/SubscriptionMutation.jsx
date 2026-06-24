import { useMutation } from "@tanstack/react-query";
import axios from "../../../axios";

const purchaseSubscription = async (planId) => {
  const { data } = await axios.post(`/subscriptions/purchase/${planId}`);
  console.log("🚀 ~ purchaseSubscription ~ data:", data);
  return data;
};

export const usePurchaseSubscription = () => {
  return useMutation({
    mutationFn: (planId) => purchaseSubscription(planId),
  });
};

const cancelSubscription = async () => {
  const { data } = await axios.delete(`/subscriptions/cancel`);
  return data;
};

export const useCancelSubscription = () => {
  return useMutation({
    mutationFn: cancelSubscription,
  });
};
