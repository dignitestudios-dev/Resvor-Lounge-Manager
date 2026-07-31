"use client";
import React, { useState } from "react";
import { useParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import EventAcceptedModal from "@/components/event-management/EventAcceptedModal";
import EventAcceptConfirmModal from "@/components/event-management/EventAcceptConfirmModal";
import EventRejectModal from "@/components/event-management/EventRejectModal";
import { useGetEventDetail } from "@/lib/hooks/queries/useEventDetail";
import {
  useRejectEvent,
  useAcceptEvent,
} from "@/lib/hooks/mutations/EventMutations";
import utils, { capitalize, getStatusColor, formatCentsToUSD } from "@/lib/utils";
import { ErrorToast, SuccessToast } from "@/components/ui/toaster";
import PageLoader from "@/components/common/PageLoader";

const EventDetails = () => {
  const params = useParams();
  const eventId = params.id;
  const queryClient = useQueryClient();

  const [isAccepted, setIsAccepted] = useState(false);
  const [isAcceptConfirmModalOpen, setIsAcceptConfirmModalOpen] =
    useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

  const { data: eventData, isLoading } = useGetEventDetail(eventId);
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

      // Invalidate queries to fetch updated status & update list/calendar views
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["event-detail", eventId] }),
        queryClient.invalidateQueries({ queryKey: ["events-list"] }),
      ]);
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

      // Invalidate queries to fetch updated status & update list/calendar views
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["event-detail", eventId] }),
        queryClient.invalidateQueries({ queryKey: ["events-list"] }),
      ]);
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
  const checkInTime = utils.formatTime12(startDateTime);
  const checkOutTime = utils.formatTime12(endDateTime);
  const checkInDate = utils.formatDateWithName(eventData.startDateTime);

  const loungeName = eventData.loungeId?.name || "Unknown Lounge";

  return (
    <div className="flex-1 flex flex-col overflow-y-auto">
      <div className="flex justify-between items-center mb-5">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Event Details</h1>
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
          <div>
            <h2 className="text-lg font-bold mb-3">Reservation Details</h2>
          </div>

          <div className="bg-white rounded-2xl p-6 mb-6">
            <div className="flex gap-6 mb-8">
              <div
                className="w-56 h-40 rounded-2xl bg-cover bg-center shrink-0"
                style={{
                  backgroundImage: `url(${eventData.loungeId?.logo?.location || "/images/lounge.jfif"})`,
                }}
              />

              <div className="flex-1">
                <div className="flex justify-between">
                  <div>
                    <h3 className="text-xl font-bold mb-2 break-words break-all">
                      {eventData?.title}
                    </h3>
                    {eventData?.loungeId?.tags?.length > 0 && (
                      <div className="flex gap-2 mb-4 flex-wrap">
                        {eventData?.loungeId?.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="bg-blue-800/20 text-blue-950 px-3 py-1 rounded-full text-sm font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-gray-700">
                      <span className="text-lg">📍</span>
                      <span className="break-words break-all">{eventData?.loungeId?.location?.address}</span>
                    </div>
                  </div>
                  <div>
                    {eventData?.status && (
                      <span
                        className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-slate-50 ${getStatusColor(
                          eventData.status,
                        )}`}
                      >
                        {capitalize(eventData.status.replaceAll("_", " "))}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-6 py-5">
              <div>
                <p className="text-black font-semibold mb-2">Event Type</p>
                <p className="text-gray-600 text-sm font-semibold break-words break-all">
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
            </div>

            <div className="grid grid-cols-5 gap-6 border-t pt-6 mb-8">
              <div>
                <p className="text-black font-semibold mb-2">Budget</p>
                <p className="text-gray-600 text-sm font-semibold">
                  ${eventData.budget || 0}
                </p>
              </div>
              <div>
                <p className="text-black font-semibold mb-2">Amount Paid</p>
                <p className="text-gray-600 text-sm font-semibold">
                  {typeof eventData?.amountPaid === "number"
                    ? utils.formatCurrency(
                      eventData.amountPaid >= 100 && Number.isInteger(eventData.amountPaid)
                        ? eventData.amountPaid / 100
                        : eventData.amountPaid
                    )
                    : eventData?.amountPaid
                      ? `$${eventData.amountPaid}`
                      : eventData?.paidAmount
                        ? `$${eventData.paidAmount}`
                        : "$0"}
                </p>
              </div>
              <div>
                <p className="text-black font-semibold mb-2">Preferred Music</p>
                <p className="text-gray-600 text-sm font-semibold break-words break-all">
                  {eventData.preferredMusic || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-black font-semibold mb-2">Special Request</p>
                <p className="text-gray-600 text-sm font-semibold break-words break-all">
                  {eventData.specialRequest || "None"}
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
              <p className="text-black font-semibold mb-3">
                Services and Packages
              </p>
              <div className="flex flex-wrap gap-4">
                {eventData?.servicePackageIds?.length > 0 ? (
                  eventData?.servicePackageIds?.map((service, index) => (
                    <div
                      key={service?._id || service?.id || index}
                      className="flex-1 min-w-[240px] max-w-[340px] rounded-lg bg-gray-50 border border-gray-100 p-3.5"
                    >
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold text-[#181818] text-[15px] break-words">
                          {service.name}
                        </h4>
                        {service.price !== undefined && service.price !== null && (
                          <span className="text-[#010067] font-semibold text-[14px]">
                            ({formatCentsToUSD(Number(service?.price || 0).toFixed(2))})
                          </span>
                        )}
                      </div>
                      {service.description && (
                        <p className="mt-1 text-[13px] leading-5 text-gray-600 break-words whitespace-pre-wrap">
                          {service.description}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600 text-sm font-semibold">
                    No services selected
                  </p>
                )}
              </div>
            </div>

            <div className="border-t pt-6">
              <p className="font-semibold mb-3">
                Any Instructions{" "}
                <span className="text-gray-400 font-normal">(Optional)</span>
              </p>
              <p className="text-gray-700 leading-relaxed text-sm break-words break-all">
                {eventData.description || "No instructions provided"}
              </p>
            </div>
          </div>

          <h2 className="text-lg font-bold mb-3">User Information</h2>

          <div className="bg-white rounded-2xl p-6">
            <div className="grid grid-cols-3 gap-12">
              <div>
                <p className="text-black font-semibold mb-2">Name</p>
                <p className="text-gray-600 text-sm font-semibold break-words break-all">
                  {eventData.userId?.firstName || eventData?.guestName || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-black font-semibold mb-2">Email Address</p>
                <p className="text-gray-600 text-sm font-semibold break-words break-all">
                  {eventData.userId?.email || eventData?.guestEmail || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-black font-semibold mb-2">Phone Number</p>
                <p className="text-gray-600 text-sm font-semibold break-words break-all">
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
