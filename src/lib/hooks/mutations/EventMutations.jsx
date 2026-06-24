import { useMutation } from "@tanstack/react-query";
import axiosInstance from "@/axios";

// Create an event
const createEvent = async (data) => {
  const response = await axiosInstance.post("/events/manager", {
    loungeId: data.loungeId,
    title: data.title,
    eventType: data.eventType,
    description: data.description,
    guestCount: data.guestCount,
    budget: data.budget,
    preferredMusic: data.preferredMusic,
    specialRequest: data.specialRequest,
    startDateTime: data.startDateTime,
    endDateTime: data.endDateTime,
    guestName: data.guestName,
    guestPhone: data.guestPhone,
    guestEmail: data.guestEmail,
    ticketAtDoor: data.ticketAtDoor,
    preferredSeatingArea: data.preferredSeatingArea,
    servicePackageIds: data.servicePackageIds,
    instructions: data.instructions,
  });
  return response.data;
};

export const useCreateEvent = () => {
  return useMutation({
    mutationFn: createEvent,
  });
};

// Reject an event
const rejectEvent = async (data) => {
  const { eventId, rejectionReason } = data;
  const response = await axiosInstance.patch(`/events/${eventId}/reject`, {
    rejectionReason,
  });
  return response.data;
};

export const useRejectEvent = () => {
  return useMutation({
    mutationFn: rejectEvent,
  });
};

// Accept an event
const acceptEvent = async (eventId) => {
  const response = await axiosInstance.patch(`/events/${eventId}/accept`);
  return response.data;
};

export const useAcceptEvent = () => {
  return useMutation({
    mutationFn: acceptEvent,
  });
};
