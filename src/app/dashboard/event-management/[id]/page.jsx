"use client";
import React, { useState } from "react";
import { useParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import EventAcceptedModal from "@/components/event-management/EventAcceptedModal";
import EventAcceptConfirmModal from "@/components/event-management/EventAcceptConfirmModal";
import EventRejectModal from "@/components/event-management/EventRejectModal";
import { useGetEventDetail } from "@/lib/hooks/queries/useEventDetail";
import { useRejectEvent, useAcceptEvent } from "@/lib/hooks/mutations/EventMutations";
import utils, { capitalize } from "@/lib/utils";
import { ErrorToast, SuccessToast } from "@/components/ui/toaster";
import PageLoader from "@/components/common/PageLoader";

const EventDetails = () => {
  const params = useParams();
  const eventId = params.id;
  const queryClient = useQueryClient();

  const [isAccepted, setIsAccepted] = useState(false);
  const [isAcceptConfirmModalOpen, setIsAcceptConfirmModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

  const { data: eventData, isLoading } = useGetEventDetail(eventId);
  console.log("🚀 ~ EventDetails ~ eventData:", eventData)
  const rejectEventMutation = useRejectEvent();
  const acceptEventMutation = useAcceptEvent();

  const handleReject = () => {
    setIsRejectModalOpen(true);
  };

  const handleRejectSubmit = async (rejectionReason) => {
    try {
      await rejectEventMutation.mutateAsync({
        eventId,
        rejectionReason,
      });

      SuccessToast("Event rejected successfully");
      setIsRejectModalOpen(false);

      // Invalidate the event detail query to fetch updated status
      await queryClient.invalidateQueries({
        queryKey: ["event-detail", eventId],
      });
    } catch (error) {
      ErrorToast(
        error?.response?.data?.message ||
        error?.message ||
        "Failed to reject event. Please try again.",
      );
      console.log("Reject event error:", error);
    }
  };

  const handleAccept = () => {
    setIsAcceptConfirmModalOpen(true);
  };

  const handleAcceptSubmit = async () => {
    try {
      await acceptEventMutation.mutateAsync(eventId);

      SuccessToast("Event accepted successfully");
      setIsAcceptConfirmModalOpen(false);
      setIsAccepted(true);

      // Invalidate the event detail query to fetch updated status
      await queryClient.invalidateQueries({
        queryKey: ["event-detail", eventId],
      });
    } catch (error) {
      ErrorToast(
        error?.response?.data?.message ||
        error?.message ||
        "Failed to accept event. Please try again.",
      );
      console.log("Accept event error:", error);
    }
  };

  if (isLoading) {
    return <PageLoader />;
  }

  if (!eventData) {
    return (
      <div className="flex-1 flex justify-center items-center">
        <div className="text-lg font-semibold text-red-600">
          Event not found
        </div>
      </div>
    );
  }

  // Parse dates
  const startDateTime = new Date(eventData.startDateTime);
  const endDateTime = new Date(eventData.endDateTime);
  const checkInTime = utils.formatTime(startDateTime);
  const checkOutTime = utils.formatTime(endDateTime);
  const checkInDate = utils.formatDateWithName(eventData.startDateTime);

  const loungeName = eventData.loungeId?.name || "Unknown Lounge";

  return (
    <div className="flex-1 flex flex-col overflow-y-auto">
      <div className="flex justify-between items-center mb-5">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Event Details</h1>
          {eventData?.status && (
            <span
              className={`px-4 py-2 rounded-full text-sm font-semibold ${eventData.status === "pending"
                ? "bg-yellow-100 text-yellow-800"
                : eventData.status === "accepted"
                  ? "bg-green-100 text-green-800"
                  : eventData.status === "rejected"
                    ? "bg-red-100 text-red-800"
                    : "bg-gray-100 text-gray-800"
                }`}
            >
              {eventData.status.charAt(0).toUpperCase() +
                eventData.status.slice(1)}
            </span>
          )}
        </div>
        <div className="flex gap-3">
          {eventData?.status === "pending" && (
            <>
              <Button
                onClick={handleReject}
                className="bg-red-600 hover:bg-red-700 w-36 font-medium text-lg"
              >
                Reject
              </Button>
              <Button
                onClick={handleAccept}
                className="bg-green-500 hover:bg-green-600 w-36 font-medium text-lg"
              >
                Accept
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-white p-5 rounded-2xl">
        <div className="bg-[#F5F5F5] rounded-2xl p-5">
          <h2 className="text-lg font-bold mb-3">Reservation Details</h2>

          <div className="bg-white rounded-2xl p-6 mb-6">
            <div className="flex gap-6 mb-8">
              <div
                className="w-56 h-40 rounded-2xl bg-cover bg-center shrink-0"
                style={{
                  backgroundImage: `url(${eventData.loungeId?.logo?.location || "/images/lounge.jfif"})`,
                }}
              />

              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">{eventData?.title}</h3>
                {eventData?.loungeId?.tags?.length > 0 && (
                  <div className="flex gap-2 mb-4">
                    {eventData?.loungeId?.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-blue-800/20 text-blue-950 px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {tag?.name}
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-2 text-gray-700">
                  <span className="text-lg">📍</span>
                  <span>{eventData?.loungeId?.location?.address}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-6 py-5">
              <div>
                <p className="text-black font-semibold mb-2">Event Type</p>
                <p className="text-gray-600 text-sm font-semibold">
                  {capitalize(eventData.eventType) || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-black font-semibold mb-2">Event Date</p>
                <p className="text-gray-600 text-sm font-semibold">
                  {checkInDate}
                </p>
              </div>
              <div>
                <p className="text-black font-semibold mb-2">Start Time</p>
                <p className="text-gray-600 text-sm font-semibold">
                  {checkInTime}
                </p>
              </div>
              <div>
                <p className="text-black font-semibold mb-2">End Time</p>
                <p className="text-gray-600 text-sm font-semibold">
                  {checkOutTime}
                </p>
              </div>
              <div>
                <p className="text-black font-semibold mb-2">Guest Count</p>
                <p className="text-gray-600 text-sm font-semibold">
                  {eventData.guestCount || 0} Guests
                </p>
              </div>

              {/* Second row - 4 columns */}
              <div>
                <p className="text-black font-semibold mb-2">Preferred Music</p>
                <p className="text-gray-600 text-sm font-semibold">
                  {eventData.preferredMusic || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-black font-semibold mb-2">Special Request</p>
                <p className="text-gray-600 text-sm font-semibold">
                  {eventData.specialRequest || "None"}
                </p>
              </div>
              <div>
                <p className="text-black font-semibold mb-2">Budget</p>
                <p className="text-gray-600 text-sm font-semibold">
                  ${eventData.budget || 0}
                </p>
              </div>
              <div>
                <p className="text-black font-semibold mb-2">
                  Ticket at Door{" "}
                  <span className="text-gray-400 font-normal">(optional)</span>
                </p>
                <p className="text-gray-600 text-sm font-semibold">None</p>
              </div>
            </div>

            <div className="border-t pt-6 mb-8">
              <div className="flex gap-12">
                <div>
                  <p className="text-black font-semibold mb-2">
                    Services and Packages
                  </p>
                  <p className="text-gray-600 text-sm font-semibold">
                    Food and Drink Package
                  </p>
                  <p className="text-gray-600 text-sm font-semibold">
                    Bottle Package
                  </p>
                </div>
                <div className="border-l pl-12">
                  <p className="text-black font-semibold mb-2">
                    Preferred Seating Area
                  </p>
                  <p className="text-gray-600 text-sm font-semibold">
                    Outdoor Terrace/ Rooftop
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <p className="font-semibold mb-3">
                Any Instructions{" "}
                <span className="text-gray-400 font-normal">(Optional)</span>
              </p>
              <p className="text-gray-700 leading-relaxed text-sm">
                {eventData.description || "No instructions provided"}
              </p>
            </div>
          </div>

          <h2 className="text-lg font-bold mb-3">User Information</h2>

          <div className="bg-white rounded-2xl p-6">
            <div className="grid grid-cols-3 gap-12">
              <div>
                <p className="text-black font-semibold mb-2">Name</p>
                <p className="text-gray-600 text-sm font-semibold">
                  {eventData.userId?.firstName || eventData?.guestName || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-black font-semibold mb-2">Email Address</p>
                <p className="text-gray-600 text-sm font-semibold">
                  {eventData.userId?.email || eventData?.guestEmail || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-black font-semibold mb-2">Phone Number</p>
                <p className="text-gray-600 text-sm font-semibold">
                  {eventData.userId?.phone || eventData?.guestPhone || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {isAccepted && (
        <EventAcceptedModal
          isOpen={isAccepted}
          onOpenChange={() => setIsAccepted(false)}
        />
      )}
      <EventAcceptConfirmModal
        isOpen={isAcceptConfirmModalOpen}
        onOpenChange={setIsAcceptConfirmModalOpen}
        onSubmit={handleAcceptSubmit}
        isLoading={acceptEventMutation.isPending}
      />
      <EventRejectModal
        isOpen={isRejectModalOpen}
        onOpenChange={setIsRejectModalOpen}
        onSubmit={handleRejectSubmit}
        isLoading={rejectEventMutation.isPending}
      />
    </div>
  );
};

export default EventDetails;
