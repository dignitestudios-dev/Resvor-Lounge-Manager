import { useMutation } from "@tanstack/react-query";
import { switchLounge, submitUpdateLounge } from "../api/Post";

export const useSwitchLounge = () =>
  useMutation({
    mutationFn: switchLounge,
  });

export const useUpdateLounge = () =>
  useMutation({
    mutationFn: submitUpdateLounge,
  });
