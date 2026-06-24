"use client";
import React, { useState, useMemo } from "react";
import DateAndMonthFilter from "@/components/common/DateAndMonthFilter";
import AddEventForm from "@/components/event-management/AddEventForm";

import Table from "@/components/event-management/Table";
import { Calendar } from "@/components/ui/calendar";
import EventCards from "@/components/event-management/EventCards";
import { Button } from "@/components/ui/button";
import EventDetailsModal from "@/components/event-management/EventDetailsModal";
import { useCreateEvent } from "@/lib/hooks/mutations/EventMutations";
import { ErrorToast, SuccessToast } from "@/components/ui/toaster";
import { useGetLounges } from "@/lib/hooks/queries/useLounges";
import { useGetEvents } from "@/lib/hooks/queries/useEvents";
import utils from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";

const EventManagement = () => {
  const queryClient = useQueryClient();
  const [isEventRequest, setIsEventRequest] = useState(false);
  const [isEventDetails, setIsEventDetails] = useState(false);
  const [eventData, setEventData] = useState(null);
  const [selectedLoungeId, setSelectedLoungeId] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [view, setView] = useState("list");
  const [selectedDate, setSelectedDate] = useState(null);

  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    selectedMonth: "",
    selectedLounge: "",
    selectedStatus: "",
  });

  // Mutations and Queries
  const createEventMutation = useCreateEvent();
  const { data: lounges = [] } = useGetLounges();
  const { data: eventsResponse, isLoading: isEventsLoading } = useGetEvents(
    currentPage,
    10,
    filters.startDate || undefined,
    filters.endDate || undefined,
    filters.selectedStatus || undefined,
  );

  // Transform API data to match table structure
  const transformEventData = (apiEvents) => {
    return apiEvents.map((event) => {
      const startDateTime = new Date(event.startDateTime);
      const endDateTime = new Date(event.endDateTime);

      // Find lounge name from lounges array
      const lounge = lounges.find((l) => l._id === event.loungeId);
      const loungeName = lounge?.loungeName || "Unknown Lounge";

      // Get user info from userId or bookedByManagerId
      const userData = event.userId || {
        firstName: "Unknown",
        lastName: "",
        _id: "",
      };
      const userName = `${userData.firstName} ${userData.lastName}`.trim();

      // Format event time
      const eventTime = `${utils.formatTime12(
        startDateTime,
      )} - ${utils.formatTime12(endDateTime)}`;

      return {
        _id: event._id,
        loungeName,
        eventName: event.title,
        user: {
          name: userName,
          profile: "/images/profile.png",
        },
        guestLimit: event.guestCount,
        eventType: event.eventType,
        eventDate: event.startDateTime,
        eventTime,
        ticketDoor: event.budget || 0,
        ...event, // Include all original data for reference
      };
    });
  };

  const transformedEvents = useMemo(() => {
    if (eventsResponse?.data) {
      return transformEventData(eventsResponse.data);
    }
    return [];
  }, [eventsResponse, lounges]);

  const handleFilterChange = (filterData) => {
    setFilters(filterData);
    setCurrentPage(1); // Reset to first page on filter change
  };

  // Filter events for the selected date
  const filteredEventsForCalendar = selectedDate
    ? transformedEvents.filter((event) => {
      try {
        const dateObj = new Date(event.eventDate);
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, "0");
        const day = String(dateObj.getDate()).padStart(2, "0");
        const eventDateLocal = `${year}-${month}-${day}`;
        return eventDateLocal === selectedDate;
      } catch (e) {
        return false;
      }
    })
    : transformedEvents;

  const handleEventRequestNext = (data) => {
    setEventData(data);
    setIsEventRequest(false);
    setIsEventDetails(true);
  };

  const handleEventDetailsClose = async () => {
    try {
      // if (!selectedLoungeId) {
      //   ErrorToast("Please select a lounge first");
      //   return;
      // }

      if (!eventData) {
        ErrorToast("Event data is missing");
        return;
      }

      const payload = {
        // loungeId: selectedLoungeId,
        title: eventData.title || eventData.eventName,
        eventType: eventData.eventType,
        description: eventData.description,
        guestCount: eventData.guestCount,
        budget: eventData.budget,
        preferredMusic: eventData.preferredMusic,
        specialRequest: eventData.specialRequest,
        startDateTime: eventData.startDateTime,
        endDateTime: eventData.endDateTime,
        guestName: eventData.guestName,
        guestPhone: eventData.guestPhone,
        guestEmail: eventData.guestEmail,
        ticketAtDoor: eventData.ticketAtDoor,
        preferredSeatingArea: eventData.preferredSeatingArea,
        servicePackageIds: eventData.servicePackageIds || [],
        instructions: eventData.instructions,
      };

      await createEventMutation.mutateAsync(payload);
      queryClient.invalidateQueries({ queryKey: ["events-list"] });

      SuccessToast("Event created successfully");

      // Reset state
      setIsEventDetails(false);
      setIsEventRequest(false);
      setEventData(null);
      setSelectedLoungeId("");
    } catch (error) {
      ErrorToast(
        error?.response?.data?.message ||
        error?.message ||
        "Failed to create event. Please try again.",
      );
      console.log("Create event error:", error);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center gap-10 mt-2">
        <h1 className="section-heading">Event Management</h1>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => {
              setEventData(null);
              setIsEventRequest(true);
            }}
            className={"border-2 h-12 text-[14px] px-6"}
          >
            Add New Event
          </Button>
          <div className="w-[260px] flex ">
            <button
              className={`text-[12px] py-3.5 px-2 rounded-l-lg w-full ${view === "list"
                ? "bg-gradient text-white"
                : "bg-[#FFFFFF] text-[#222246]"
                }`}
              onClick={() => setView("list")}
            >
              List View
            </button>
            <button
              className={`text-[12px] py-3.5 px-2 rounded-r-lg w-full ${view === "calendar"
                ? "bg-gradient text-white"
                : "bg-[#FFFFFF] text-[#222246]"
                }`}
              onClick={() => setView("calendar")}
            >
              Calendar View
            </button>
          </div>

          {isEventRequest && (
            <AddEventForm
              onClose={() => {
                setIsEventRequest(false);
                setEventData(null);
              }}
              onNext={handleEventRequestNext}
              initialData={eventData}
            />
          )}
          {view === "list" && (
            <DateAndMonthFilter
              isLounge={true}
              onFilterChange={handleFilterChange}
              statusOptions={[
                "pending",
                "awaiting_payment",
                "confirmed",
                "rejected",
                "completed",
                "cancelled",
                "expired",
                "refunded"
              ]}
            />
          )}
          {isEventDetails && (
            <EventDetailsModal
              onClickBack={() => {
                setIsEventDetails(false);
                setIsEventRequest(true);
              }}
              onClick={handleEventDetailsClose}
              onClose={() => {
                setIsEventDetails(false);
                setEventData(null);
              }}
              eventData={eventData}
              lounges={lounges}
              selectedLoungeId={selectedLoungeId}
              onLoungeSelect={setSelectedLoungeId}
              isLoading={createEventMutation.isPending}
            // serviceData={eventServices}
            />
          )}
        </div>
      </div>

      {view === "calendar" ? (
        <div className="flex-1 flex gap-8 mt-6 w-full overflow-y-auto">
          {/* Event Cards */}
          <div className="flex overflow-y-auto flex-col bg-white rounded-2xl p-4">
            <h2 className="text-lg font-semibold mb-4">
              {selectedDate
                ? `Events on ${new Date(
                  selectedDate + "T00:00:00",
                ).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}`
                : "All Events"}
            </h2>
            <div className="h-full overflow-y-auto">
              <EventCards events={filteredEventsForCalendar} />
            </div>
          </div>
          {/* Calendar */}
          <div className="flex-1">
            <Calendar
              selectedDate={selectedDate}
              onDateSelect={(iso) => setSelectedDate(iso)}
            />
          </div>
        </div>
      ) : (
        <div className="mt-6">
          <Table
            filters={filters}
            events={transformedEvents}
            isLoading={isEventsLoading}
            currentPage={currentPage}
            totalPages={eventsResponse?.pagination?.totalPages || 1}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
};

export default EventManagement;
