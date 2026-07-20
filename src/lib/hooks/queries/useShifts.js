import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/axios";

// ─── Get Eligible Events for Shifts ──────────────────────────────────────────
const fetchEligibleEvents = async ({ page = 1, limit = 100 } = {}) => {
  const { data } = await axiosInstance.get("/shifts/eligible-events", {
    params: { page, limit },
  });
  return {
    data: data?.data || [],
    pagination: data?.pagination || null,
  };
};

export const useGetEligibleEvents = ({ page = 1, limit = 100 } = {}) => {
  return useQuery({
    queryKey: ["eligible-events", page, limit],
    queryFn: () => fetchEligibleEvents({ page, limit }),
    keepPreviousData: true,
  });
};

// ─── Get Confirmed Events and Bookings ───────────────────────────────────────
const fetchConfirmedEventsAndBookings = async (date) => {
  if (!date) return [];
  const { data } = await axiosInstance.get("/shifts/confirmed-events-and-bookings", {
    params: { date },
  });
  return data?.data || [];
};

export const useGetConfirmedEventsAndBookings = (date) => {
  return useQuery({
    queryKey: ["confirmed-events-and-bookings", date],
    queryFn: () => fetchConfirmedEventsAndBookings(date),
    enabled: !!date,
  });
};

// ─── Get All Shifts ──────────────────────────────────────────────────────────
const fetchShifts = async ({ page = 1, limit = 10 } = {}) => {
  const { data } = await axiosInstance.get("/shifts", {
    params: { page, limit },
  });
  return {
    data: data?.data || [],
    pagination: data?.pagination || null,
  };
};

export const useGetShifts = ({ page = 1, limit = 10 } = {}) => {
  return useQuery({
    queryKey: ["shifts-list", page, limit],
    queryFn: () => fetchShifts({ page, limit }),
    keepPreviousData: true,
  });
};

// ─── Get Single Shift By ID ──────────────────────────────────────────────────
const fetchShiftById = async (id) => {
  const { data } = await axiosInstance.get(`/shifts/${id}`);
  return data?.data || null;
};

export const useGetShiftById = (id) => {
  return useQuery({
    queryKey: ["shift-detail", id],
    queryFn: () => fetchShiftById(id),
    enabled: !!id,
  });
};
