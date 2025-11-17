"use client"
import React, { useState } from "react";
import DateAndMonthFilter from "@/components/common/DateAndMonthFilter";
import AddEventForm from "@/components/event-management/AddEventForm";
import Table from "@/components/event-management/Table";

const EventManagement = () => {
  const [openForm, setOpenForm] = useState(false);

  return (
    <div>
      <div className="flex justify-between items-center gap-10">
        <h1 className="section-heading">Event Management</h1>

        <div className="flex items-center gap-5">
          <AddEventForm isOpen={openForm} onOpenChange={setOpenForm} />
          <DateAndMonthFilter />
        </div>
      </div>

      <div className="mt-10">
        <Table />
      </div>
    </div>
  );
};

export default EventManagement;
