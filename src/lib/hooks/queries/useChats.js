import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/axios";

// ─── Get All Manager Chats ───────────────────────────────────────────────────
const fetchChats = async () => {
  const { data } = await axiosInstance.get("/chats");
  return data?.data || [];
};

export const useGetChats = (options = {}) => {
  return useQuery({
    queryKey: ["chats-list"],
    queryFn: fetchChats,
    refetchOnWindowFocus: false,
    ...options,
  });
};

// ─── Get Messages for a Chat (paginated) ────────────────────────────────────
const fetchMessages = async ({ chatId, page = 1, limit = 50 }) => {
  const { data } = await axiosInstance.get(`/chats/${chatId}/messages`, {
    params: { page, limit },
  });
  return {
    messages: data?.data || [],
    pagination: data?.pagination || null,
  };
};

export const useGetMessages = (chatId, options = {}) => {
  return useQuery({
    queryKey: ["chat-messages", chatId],
    queryFn: () => fetchMessages({ chatId }),
    enabled: !!chatId,
    refetchOnWindowFocus: false,
    ...options,
  });
};
