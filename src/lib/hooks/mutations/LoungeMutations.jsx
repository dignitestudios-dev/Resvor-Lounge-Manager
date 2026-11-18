import { useMutation, useQueryClient } from "@tanstack/react-query";
import { switchLounge, submitUpdateLounge } from "../api/Post";
import { deleteLounge } from "../api/Delete";

export const useSwitchLounge = () =>
  useMutation({
    mutationFn: switchLounge,
  });

export const useUpdateLounge = () =>
  useMutation({
    mutationFn: submitUpdateLounge,
  });

export const useDeleteLounge = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteLounge,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lounges-list"] });
      queryClient.invalidateQueries({ queryKey: ["active-lounge"] });
      queryClient.invalidateQueries({ queryKey: ["auth-me"] });
    },
  });
};
