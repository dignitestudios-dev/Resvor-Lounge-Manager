import { useMutation } from "@tanstack/react-query";
import axiosInstance from "@/axios";

// Create a guest
const createGuest = async (data) => {
  const response = await axiosInstance.post("/guestbook", {
    loungeId: data.loungeId,
    fullName: data.fullName,
    email: data.email,
  });
  return response.data;
};

export const useCreateGuest = () => {
  return useMutation({
    mutationFn: createGuest,
  });
};

// Update/Edit a guest
const updateGuest = async (data) => {
  const response = await axiosInstance.patch(`/guestbook/${data.entryId}`, {
    fullName: data.fullName,
    email: data.email,
  });
  return response.data;
};

export const useUpdateGuest = () => {
  return useMutation({
    mutationFn: updateGuest,
  });
};

// Delete a guest
const deleteGuest = async (entryId) => {
  const response = await axiosInstance.delete(`/guestbook/${entryId}`);
  return response.data;
};

export const useDeleteGuest = () => {
  return useMutation({
    mutationFn: deleteGuest,
  });
};

// Import CSV guestbook
const importGuestbook = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await axiosInstance.post("/guestbook/import", formData);
  return response.data;
};

export const useImportGuestbook = () => {
  return useMutation({
    mutationFn: importGuestbook,
  });
};

// Export CSV guestbook
const exportGuestbook = async () => {
  const response = await axiosInstance.get("/guestbook/export", {
    responseType: "blob",
  });
  return response.data;
};

export const useExportGuestbook = () => {
  return useMutation({
    mutationFn: exportGuestbook,
  });
};

