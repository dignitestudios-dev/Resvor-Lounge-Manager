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
const isTodayOrFuture = (dateStr) => {
  if (!dateStr) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const parts = dateStr.split("T")[0].split("-").map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return true;

  const [year, month, day] = parts;
  const targetDate = new Date(year, month - 1, day);
  targetDate.setHours(0, 0, 0, 0);

  return targetDate.getTime() >= today.getTime();
};

const fetchConfirmedEventsAndBookings = async (date) => {
  if (!date || !isTodayOrFuture(date)) return [];
  const { data } = await axiosInstance.get("/shifts/confirmed-events-and-bookings", {
    params: { date },
  });
  return data?.data || [];
};

export const useGetConfirmedEventsAndBookings = (date, options = {}) => {
  const isValidDate = !!date && isTodayOrFuture(date);
  return useQuery({
    queryKey: ["confirmed-events-and-bookings", date],
    queryFn: () => fetchConfirmedEventsAndBookings(date),
    enabled: isValidDate && (options.enabled !== undefined ? options.enabled : true),
    retry: false,
    refetchOnWindowFocus: false,
    ...options,
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
