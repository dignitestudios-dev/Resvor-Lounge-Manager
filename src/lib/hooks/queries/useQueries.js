import { useQuery } from "@tanstack/react-query";
import axios from "../../../axios";

const fetchAuthMe = async () => {
  const { data } = await axios.get(`/auth/me?t=${Date.now()}`, {
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
    },
  });
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

/* ─── Stripe Connect Queries ───────────────────────── */
const fetchConnectStatus = async () => {
  const { data } = await axios.get("/connect/status");
  return data;
};

export const useGetConnectStatus = (options = {}) => {
  return useQuery({
    queryKey: ["connect-status"],
    queryFn: fetchConnectStatus,
    retry: false,
    refetchOnWindowFocus: false,
    ...options,
  });
};

/* ─── Get Connect Banks ────────────────────────────── */
const fetchConnectBanks = async () => {
  const { data } = await axios.get("/connect/banks");
  return data;
};

export const useGetConnectBanks = (options = {}) => {
  return useQuery({
    queryKey: ["connect-banks"],
    queryFn: fetchConnectBanks,
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

export const useGetCampaigns = ({ page = 1, limit = 10 } = {}, options = {}) => {
  return useQuery({
    queryKey: ["campaigns", page, limit],
    queryFn: () => getCampaigns({ page, limit }),
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

/* ─── Notification Queries ────────────────────────── */
const fetchNotifications = async (page = 1, limit = 10) => {
  const { data } = await axios.get("/notifications", {
    params: { page, limit },
  });
  return data;
};

export const useNotifications = (page = 1, limit = 10, options = {}) => {
  return useQuery({
    queryKey: ["notifications", page, limit],
    queryFn: () => fetchNotifications(page, limit),
    retry: false,
    refetchOnWindowFocus: false,
    ...options,
  });
};
