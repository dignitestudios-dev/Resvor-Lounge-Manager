"use client";
import React, { useState } from "react";
import DateAndMonthFilter from "@/components/common/DateAndMonthFilter";
import AddEventForm from "@/components/event-management/AddEventForm";

import Table from "@/components/event-management/Table";
import { Calendar } from "@/components/ui/calendar";
import EventCards from "@/components/event-management/EventCards";

const EventManagement = () => {
  const [openForm, setOpenForm] = useState(false);
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    selectedMonth: "",
    selectedLounge: "",
  });

  const handleFilterChange = (filterData) => {
    setFilters(filterData);
  };

  // Calendar/List view toggle
  const [view, setView] = useState("list");

  const [selectedDate, setSelectedDate] = useState(null);

  // Use the same events as Table for now (add dummy events across dates)
  const events = [
    {
      loungeName: "First Lounge",
      eventName: "Summer Night Bash",
      user: { name: "Olivia Carter", profile: "/images/profile.png" },
      guestLimit: 150,
      eventType: "Beach Party",
      eventDate: "2025-07-22T19:00:00Z",
      eventTime: "07:00 PM - 10:00 PM",
      ticketDoor: 25,
    },
    {
      loungeName: "First Lounge",
      eventName: "Cocktail Friday",
      user: { name: "Ethan Moore", profile: "/images/profile.png" },
      guestLimit: 80,
      eventType: "Corporate Meetup",
      eventDate: "2025-08-05T20:30:00Z",
      eventTime: "08:30 PM - 11:00 PM",
      ticketDoor: 18,
    },
    {
      loungeName: "First Lounge",
      eventName: "Winter Wonderland",
      user: { name: "Sophia Kim", profile: "/images/profile.png" },
      guestLimit: 300,
      eventType: "Charity Gala",
      eventDate: "2025-12-20T18:00:00Z",
      eventTime: "06:00 PM - 11:00 PM",
      ticketDoor: 40,
    },
    {
      loungeName: "Second Lounge",
      eventName: "Beach Cocktail Fiesta",
      user: { name: "Liam Parker", profile: "/images/profile.png" },
      guestLimit: 200,
      eventType: "Sunset Gathering",
      eventDate: "2025-09-10T17:00:00Z",
      eventTime: "05:00 PM - 09:00 PM",
      ticketDoor: 30,
    },
    {
      loungeName: "Second Lounge",
      eventName: "New Year Sparkles",
      user: { name: "Emma Davis", profile: "/images/profile.png" },
      guestLimit: 500,
      eventType: "New Year Celebration",
      eventDate: "2025-12-31T21:00:00Z",
      eventTime: "09:00 PM - 01:00 AM",
      ticketDoor: 50,
    },
    {
      loungeName: "First Lounge",
      eventName: "Birthday Bash Deluxe",
      user: { name: "Michael Reed", profile: "/images/profile.png" },
      guestLimit: 120,
      eventType: "Birthday Party",
      eventDate: "2025-11-15T18:30:00Z",
      eventTime: "06:30 PM - 10:30 PM",
      ticketDoor: 20,
    },
    {
      loungeName: "First Lounge",
      eventName: "Wedding Afterparty",
      user: { name: "Ava Martinez", profile: "/images/profile.png" },
      guestLimit: 250,
      eventType: "Wedding Celebration",
      eventDate: "2025-10-05T19:00:00Z",
      eventTime: "07:00 PM - 12:00 AM",
      ticketDoor: 45,
    },
    {
      loungeName: "Second Lounge",
      eventName: "Tech Founders Meetup",
      user: { name: "Noah Johnson", profile: "/images/profile.png" },
      guestLimit: 100,
      eventType: "Networking Event",
      eventDate: "2025-11-25T17:30:00Z",
      eventTime: "05:30 PM - 09:00 PM",
      ticketDoor: 35,
    },
    {
      loungeName: "First Lounge",
      eventName: "Jazz & Wine Night",
      user: { name: "Luna Garcia", profile: "/images/profile.png" },
      guestLimit: 90,
      eventType: "Live Music Event",
      eventDate: "2025-12-10T20:00:00Z",
      eventTime: "08:00 PM - 11:00 PM",
      ticketDoor: 28,
    },
    {
      loungeName: "First Lounge",
      eventName: "Family Fun Festival",
      user: { name: "Daniel Lee", profile: "/images/profile.png" },
      guestLimit: 400,
      eventType: "Community Festival",
      eventDate: "2025-09-25T10:00:00Z",
      eventTime: "10:00 AM - 06:00 PM",
      ticketDoor: 15,
    },
  ];

  // Filter events for the selected date (ensure selectedDate is ISO string)
  // If no date selected, show all events; if date selected, show only that date's events
  const filteredEvents = selectedDate
    ? events.filter((event) => {
        if (!selectedDate) return false;
        try {
          const eventDateISO = new Date(event.eventDate)
            .toISOString()
            .slice(0, 10);
          return eventDateISO === selectedDate;
        } catch (e) {
          return false;
        }
      })
    : events;
  console.log("🚀 ~ EventManagement ~ filteredEvents:", filteredEvents);

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center gap-10 mt-2">
        <h1 className="section-heading">Event Management</h1>
        <div className="flex items-center gap-3">
          <div className="w-[260px] flex ">
            <button
              className={`text-[12px] py-3.5 px-2 rounded-l-lg w-full ${
                view === "list"
                  ? "bg-gradient text-white"
                  : "bg-[#FFFFFF] text-[#222246]"
              }`}
              onClick={() => setView("list")}
            >
              List View
            </button>
            <button
              className={`text-[12px] py-3.5 px-2 rounded-r-lg w-full ${
                view === "calendar"
                  ? "bg-gradient text-white"
                  : "bg-[#FFFFFF] text-[#222246]"
              }`}
              onClick={() => setView("calendar")}
            >
              Calendar View
            </button>
          </div>
          <AddEventForm isOpen={openForm} onOpenChange={setOpenForm} />
          {view === "list" && (
            <DateAndMonthFilter
              isLounge={true}
              onFilterChange={handleFilterChange}
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
                    selectedDate + "T00:00:00"
                  ).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}`
                : "All Events"}
            </h2>
            <div className="h-full overflow-y-auto">
              <EventCards events={filteredEvents} />
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
          <Table filters={filters} events={events} />
        </div>
      )}
    </div>
  );
};

export default EventManagement;
