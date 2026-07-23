import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/axios";

// ─── Initiate or Get Existing Chat ──────────────────────────────────────────
// For Manager → User: pass { loungeId }
// For Manager → Bartender: pass { bartenderId }
const initiateChat = async (payload) => {
  const { data } = await axiosInstance.post("/chats", payload);
  return data?.data || data;
};

export const useInitiateChat = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: initiateChat,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chats-list"] });
    },
  });
};

// ─── Send a Message ──────────────────────────────────────────────────────────
const sendMessage = async ({ chatId, text, type = "TEXT" }) => {
  const { data } = await axiosInstance.post(`/chats/${chatId}/messages`, {
    type,
    text,
  });
  return data?.data || data;
};

export const useSendMessage = () => {
  return useMutation({
    mutationFn: sendMessage,
  });
};
