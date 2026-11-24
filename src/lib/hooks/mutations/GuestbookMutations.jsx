import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/axios";

// Create a guest
const createGuest = async (data) => {
  if (data?.photo instanceof File) {
    const formData = new FormData();
    if (data.loungeId) formData.append("loungeId", data.loungeId);
    if (data.firstName) formData.append("firstName", data.firstName);
    if (data.lastName) formData.append("lastName", data.lastName);
    if (data.fullName && !data.firstName && !data.lastName) {
      formData.append("fullName", data.fullName);
    }
    if (data.email) formData.append("email", data.email);
    if (data.company) formData.append("company", data.company);
    if (data.title) formData.append("title", data.title);
    if (data.website) formData.append("website", data.website);
    if (data.nickname) formData.append("nickname", data.nickname);
    if (data.birthMonth !== undefined && data.birthMonth !== null) {
      formData.append("birthMonth", data.birthMonth);
    }
    if (data.phoneNumber) formData.append("phoneNumber", data.phoneNumber);
    if (data.details) formData.append("details", data.details);

    if (data.address) {
      formData.append("address", JSON.stringify(data.address));
    }

    if (data.socialNetwork) {
      formData.append("socialNetwork", JSON.stringify(data.socialNetwork));
    }

    if (data.specialDates) {
      const dates = Array.isArray(data.specialDates)
        ? data.specialDates.filter((item) => item?.title?.trim() && item?.date)
        : [];
      if (dates.length > 0) {
        formData.append("specialDates", JSON.stringify(dates));
      }
    }

    formData.append("photo", data.photo);
    const response = await axiosInstance.post("/guestbook", formData);
    return response.data;
  }

  const { photo, ...jsonPayload } = data;
  const response = await axiosInstance.post("/guestbook", jsonPayload);
  return response.data;
};

export const useCreateGuest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createGuest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guestbook-list"] });
    },
  });
};

// Update/Edit a guest
const updateGuest = async ({ entryId, ...data }) => {
  if (data?.photo instanceof File) {
    const formData = new FormData();
    if (data.loungeId) formData.append("loungeId", data.loungeId);
    if (data.firstName) formData.append("firstName", data.firstName);
    if (data.lastName) formData.append("lastName", data.lastName);
    if (data.fullName && !data.firstName && !data.lastName) {
      formData.append("fullName", data.fullName);
    }
    if (data.email) formData.append("email", data.email);
    if (data.company) formData.append("company", data.company);
    if (data.title) formData.append("title", data.title);
    if (data.website) formData.append("website", data.website);
    if (data.nickname) formData.append("nickname", data.nickname);
    if (data.birthMonth !== undefined && data.birthMonth !== null) {
      formData.append("birthMonth", data.birthMonth);
    }
    if (data.phoneNumber) formData.append("phoneNumber", data.phoneNumber);
    if (data.details !== undefined && data.details !== null) {
      formData.append("details", data.details);
    }

    if (data.address) {
      formData.append("address", JSON.stringify(data.address));
    }

    if (data.socialNetwork) {
      formData.append("socialNetwork", JSON.stringify(data.socialNetwork));
    }

    if (data.specialDates !== undefined) {
      const dates = Array.isArray(data.specialDates)
        ? data.specialDates.filter((item) => item?.title?.trim() && item?.date)
        : [];
      formData.append("specialDates", JSON.stringify(dates));
    }

    formData.append("photo", data.photo);
    const response = await axiosInstance.patch(`/guestbook/${entryId}`, formData);
    return response.data;
  }

  const { photo, ...jsonPayload } = data;
  const response = await axiosInstance.patch(`/guestbook/${entryId}`, jsonPayload);
  return response.data;
};

export const useUpdateGuest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateGuest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guestbook-list"] });
    },
  });
};

// Delete a guest
const deleteGuest = async (entryId) => {
  const response = await axiosInstance.delete(`/guestbook/${entryId}`);
  return response.data;
};

export const useDeleteGuest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteGuest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guestbook-list"] });
    },
  });
};

// Import CSV guestbook
const importGuestbook = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await axiosInstance.post("/guestbook/import", formData, {
    timeout: 600000, // 10 minutes
  });
  return response.data;
};

export const useImportGuestbook = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: importGuestbook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guestbook-list"] });
    },
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


