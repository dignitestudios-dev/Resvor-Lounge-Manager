"use client";
import React, { useState } from "react";
import DateAndMonthFilter from "@/components/common/DateAndMonthFilter";
import AddEventForm from "@/components/event-management/AddEventForm";
import Table from "@/components/event-management/Table";

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

  return (
    <div>
      <div className="flex justify-between items-center gap-10">
        <h1 className="section-heading">Event Management</h1>

        <div className="flex items-center gap-5">
          <AddEventForm isOpen={openForm} onOpenChange={setOpenForm} />
          <DateAndMonthFilter
            isLounge={true}
            onFilterChange={handleFilterChange}
          />
        </div>
      </div>

      <div className="mt-10">
        <Table filters={filters} />
      </div>
    </div>
  );
};

export default EventManagement;
