import { useMutation } from "@tanstack/react-query";
import { submitCreateCampaign, retryCampaign } from "../api/Post";

export const useCreateCampaign = () => {
  return useMutation({
    mutationFn: submitCreateCampaign,
  });
};

export const useRetryCampaign = () => {
  return useMutation({
    mutationFn: retryCampaign,
  });
};
