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
  const [view, setView] = useState("calendar");
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Use the same events as Table for now
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
    // ... (add all your events here, or import from a shared file)
  ];

  // Filter events for the selected date
  const filteredEvents = events.filter(
    (event) =>
      new Date(event.eventDate).toDateString() === selectedDate.toDateString()
  );

  return (
    <div>
      <div className="flex justify-between items-center gap-10 mt-2">
        <h1 className="section-heading">Event Management</h1>
        <div className="flex items-center gap-3">
          <div className="w-[260px] flex ">
            <button
              className={`text-[12px] py-4 px-2 rounded-l-xl w-full ${
                view === "calendar"
                  ? "bg-[#222246] text-white"
                  : "bg-[#FFFFFF] text-[#222246]"
              }`}
              onClick={() => setView("list")}
            >
              List View
            </button>
            <button
              className={`text-[12px] py-4 px-2 rounded-r-xl w-full ${
                view === "list"
                  ? "bg-[#222246] text-white"
                  : "bg-[#FFFFFF] text-[#222246]"
              }`}
              onClick={() => setView("calendar")}
            >
              Calendar View
            </button>
          </div>
          <AddEventForm isOpen={openForm} onOpenChange={setOpenForm} />
          <DateAndMonthFilter
            isLounge={true}
            onFilterChange={handleFilterChange}
          />
        </div>
      </div>

      {view === "calendar" ? (
        <div className="flex gap-8 mt-6">
          {/* Event Cards */}
          <div className="flex-1">
            <h2 className="text-lg font-semibold mb-4">
              Events on{" "}
              {selectedDate.toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </h2>
            <EventCards events={filteredEvents} />
          </div>
          {/* Calendar */}
          <div className="w-[70%]">
            <Calendar selected={selectedDate} onSelect={setSelectedDate} />
          </div>
        </div>
      ) : (
        <div className="mt-6">
          <Table filters={filters} />
        </div>
      )}
    </div>
  );
};

export default EventManagement;
