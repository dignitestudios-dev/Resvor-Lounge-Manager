import { useQuery } from "@tanstack/react-query";
import axios from "../../../axios";

const fetchAuthMe = async () => {
  const { data } = await axios.get("/auth/me");
  return data?.data || null;
};

export const useAuthMe = (options = {}) => {
  return useQuery({
    queryKey: ["auth-me"],
    queryFn: fetchAuthMe,
    retry: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
    gcTime: Infinity,
    ...options,
  });
};

/* ─── Wallet Queries ─────────────────────────────── */
const fetchWalletMe = async () => {
  const { data } = await axios.get("/wallet/me");
  return data;
};

export const useWalletMe = (options = {}) => {
  return useQuery({
    queryKey: ["wallet-me"],
    queryFn: fetchWalletMe,
    retry: false,
    refetchOnWindowFocus: false,
    ...options,
  });
};

const fetchWalletTransactions = async ({ page = 1, limit = 10 } = {}) => {
  const { data } = await axios.get(`/wallet/transactions?page=${page}&limit=${limit}`);
  return data;
};

export const useWalletTransactions = ({ page = 1, limit = 10 } = {}, options = {}) => {
  return useQuery({
    queryKey: ["wallet-transactions", page, limit],
    queryFn: () => fetchWalletTransactions({ page, limit }),
    retry: false,
    refetchOnWindowFocus: false,
    ...options,
  });
};

/* ─── Campaign Queries ────────────────────────────── */
import { getCampaigns, getCampaignById } from "../api/Post";

export const useGetCampaigns = (options = {}) => {
  return useQuery({
    queryKey: ["campaigns"],
    queryFn: getCampaigns,
    retry: false,
    refetchOnWindowFocus: false,
    ...options,
  });
};

export const useGetCampaignById = (campaignId, options = {}) => {
  return useQuery({
    queryKey: ["campaign", campaignId],
    queryFn: () => getCampaignById(campaignId),
    enabled: !!campaignId,
    retry: false,
    refetchOnWindowFocus: false,
    ...options,
  });
};
