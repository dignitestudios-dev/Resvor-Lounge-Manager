import { useMutation } from "@tanstack/react-query";
import { switchLounge } from "../api/Post";

export const useSwitchLounge = () =>
  useMutation({
    mutationFn: switchLounge,
  });
