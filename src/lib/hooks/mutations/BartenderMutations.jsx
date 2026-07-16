import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/axios";

// ─── Create Bartender ───────────────────────────────────────────────────────
const createBartender = async (data) => {
  const formData = new FormData();
  formData.append("fullName", data.fullName);
  formData.append("email", data.email);
  formData.append("password", data.password);
  formData.append("phoneNumber", data.phoneNumber);
  formData.append("address", data.address);
  if (data.profileImage) {
    formData.append("profileImage", data.profileImage);
  }
  const response = await axiosInstance.post("/bartenders", formData);
  return response.data;
};

export const useCreateBartender = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createBartender,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bartenders-list"] });
    },
  });
};

// ─── Update Bartender ────────────────────────────────────────────────────────
const updateBartender = async ({ id, ...data }) => {
  const hasFile = data.profileImage instanceof File;

  if (hasFile) {
    const formData = new FormData();
    if (data.fullName) formData.append("fullName", data.fullName);
    if (data.email) formData.append("email", data.email);
    if (data.phoneNumber) formData.append("phoneNumber", data.phoneNumber);
    if (data.address) formData.append("address", data.address);
    formData.append("profileImage", data.profileImage);

    const response = await axiosInstance.patch(`/bartenders/${id}`, formData);
    return response.data;
  } else {
    const payload = {};
    if (data.fullName) payload.fullName = data.fullName;
    if (data.email) payload.email = data.email;
    if (data.phoneNumber) payload.phoneNumber = data.phoneNumber;
    if (data.address) payload.address = data.address;
    if (data.removePFP !== undefined) payload.removePFP = data.removePFP;

    const response = await axiosInstance.patch(`/bartenders/${id}`, payload);
    return response.data;
  }
};

export const useUpdateBartender = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateBartender,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bartenders-list"] });
      queryClient.invalidateQueries({ queryKey: ["bartender-detail"] });
    },
  });
};

// ─── Update Bartender Password ───────────────────────────────────────────────
const updateBartenderPassword = async ({ id, currentPassword, newPassword }) => {
  const response = await axiosInstance.patch(
    `/bartenders/${id}/update-password`,
    { currentPassword, newPassword }
  );
  return response.data;
};

export const useUpdateBartenderPassword = () => {
  return useMutation({
    mutationFn: updateBartenderPassword,
  });
};

// ─── Delete Bartender ────────────────────────────────────────────────────────
const deleteBartender = async (id) => {
  const response = await axiosInstance.delete(`/bartenders/${id}`);
  return response.data;
};

export const useDeleteBartender = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteBartender,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bartenders-list"] });
    },
  });
};
