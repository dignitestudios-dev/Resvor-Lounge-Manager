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

/**
 * Helper to extract YYYY-MM-DD reliably without timezone conversion shifts
 */
export const extractDateString = (dateInput) => {
  if (!dateInput) return "";
  if (typeof dateInput === "string") {
    const match = dateInput.match(/^(\d{4}-\d{2}-\d{2})/);
    if (match) return match[1];
  }
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return "";
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

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

  // Calculate parameters for API query based on view and date selection
  const queryLimit = view === "calendar" ? 100 : 10;
  const effectiveStartDate =
    view === "calendar" && selectedDate
      ? selectedDate
      : filters.startDate || undefined;
  const effectiveEndDate =
    view === "calendar" && selectedDate
      ? selectedDate
      : filters.endDate || undefined;
  const effectivePage = view === "calendar" ? 1 : currentPage;

  // Mutations and Queries
  const createEventMutation = useCreateEvent();
  const { data: lounges = [] } = useGetLounges();
  const { data: eventsResponse, isLoading: isEventsLoading } = useGetEvents(
    effectivePage,
    queryLimit,
    effectiveStartDate,
    effectiveEndDate,
    filters.selectedStatus || undefined,
  );

  // Transform API data to match table and calendar structure
  const transformEventData = (apiEvents) => {
    return (apiEvents || []).map((event) => {
      const startDateTime = event.startDateTime
        ? new Date(event.startDateTime)
        : new Date();
      const endDateTime = event.endDateTime
        ? new Date(event.endDateTime)
        : new Date();

      // Find lounge name from lounges array
      const lounge = lounges.find((l) => l._id === event.loungeId);
      const loungeName =
        lounge?.loungeName || event.loungeId?.name || "Unknown Lounge";

      // Get user info from userId or guestName
      const userData = event.userId || {
        firstName: event.guestName || "Unknown",
        lastName: "",
        _id: "",
      };
      const userName =
        `${userData.firstName || ""} ${userData.lastName || ""}`.trim() ||
        event.guestName ||
        "Unknown Guest";

      // Format event time
      const eventTime = `${utils.formatTime12(
        startDateTime,
      )} - ${utils.formatTime12(endDateTime)}`;

      const eventDateStr = extractDateString(event.startDateTime);

      return {
        _id: event._id,
        loungeName,
        eventName: event.title || event.eventName || "Untitled Event",
        user: {
          name: userName,
          profile: "/images/profile.png",
        },
        guestLimit: event.guestCount || 0,
        eventType: event.eventType || "N/A",
        eventDate: event.startDateTime,
        eventDateStr,
        eventTime,
        ticketDoor: event.budget || 0,
        guestName: event.guestName || userName,
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

  // List of YYYY-MM-DD date strings that have events (for calendar dots)
  const eventDatesList = useMemo(() => {
    return transformedEvents
      .map((e) => e.eventDateStr || extractDateString(e.eventDate || e.startDateTime))
      .filter(Boolean);
  }, [transformedEvents]);

  const handleFilterChange = (filterData) => {
    setFilters(filterData);
    setCurrentPage(1); // Reset to first page on filter change
  };

  // Filter events for the selected date on calendar view
  const filteredEventsForCalendar = useMemo(() => {
    if (!selectedDate) return transformedEvents;
    return transformedEvents.filter((event) => {
      const eDateStr =
        event.eventDateStr ||
        extractDateString(event.eventDate || event.startDateTime);
      return eDateStr === selectedDate;
    });
  }, [transformedEvents, selectedDate]);

  const handleEventRequestNext = (data) => {
    setEventData(data);
    setIsEventRequest(false);
    setIsEventDetails(true);
  };

  const handleEventDetailsClose = async () => {
    try {
      if (!eventData) {
        ErrorToast("Event data is missing");
        return;
      }

      const payload = {
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
            className={"border-2 h-12 text-[14px] px-6 cursor-pointer"}
          >
            Add New Event
          </Button>
          <div className="w-[260px] flex ">
            <button
              className={`text-[12px] py-3.5 px-2 rounded-l-lg w-full cursor-pointer transition ${view === "list"
                ? "bg-gradient text-white"
                : "bg-[#FFFFFF] text-[#222246]"
                }`}
              onClick={() => setView("list")}
            >
              List View
            </button>
            <button
              className={`text-[12px] py-3.5 px-2 rounded-r-lg w-full cursor-pointer transition ${view === "calendar"
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
                "refunded",
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
            />
          )}
        </div>
      </div>

      {view === "calendar" ? (
        <div className="flex-1 flex gap-8 mt-6 w-full overflow-y-auto">
          {/* Event Cards */}
          <div className="w-1/2 flex overflow-y-auto flex-col bg-white rounded-2xl p-4">
            <h2 className="text-lg font-semibold mb-4 text-[#1a1a6e]">
              {selectedDate
                ? `Events on ${new Date(
                  selectedDate + "T00:00:00",
                ).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}`
                : "All Scheduled Events"}
            </h2>
            <div className="h-full overflow-y-auto pr-1">
              <EventCards events={filteredEventsForCalendar} />
            </div>
          </div>
          {/* Calendar */}
          <div className="flex-1">
            <Calendar
              selectedDate={selectedDate}
              onDateSelect={(iso) => setSelectedDate(iso)}
              eventDates={eventDatesList}
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
