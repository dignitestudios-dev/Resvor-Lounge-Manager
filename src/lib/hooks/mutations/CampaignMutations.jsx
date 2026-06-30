import { useMutation } from "@tanstack/react-query";
import { submitCreateCampaign } from "../api/Post";

export const useCreateCampaign = () => {
  return useMutation({
    mutationFn: submitCreateCampaign,
  });
};
