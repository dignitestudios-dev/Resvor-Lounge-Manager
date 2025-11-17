"use client";
import DateAndMonthFilter from "@/components/common/DateAndMonthFilter";
import AddServiceForm from "@/components/services/AddServiceForm";
import Table from "@/components/services/Table";
import React, { useState } from "react";

const Services = () => {
  const [openForm, setOpenForm] = useState(false);

  return (
    <div>
      <div className="flex justify-between items-center gap-10">
        <h1 className="section-heading">Services</h1>

        <div className="flex items-center gap-5">
          <AddServiceForm isOpen={openForm} onOpenChange={setOpenForm} />
          <DateAndMonthFilter />
        </div>
      </div>

      <div className="mt-10">
        <Table />
      </div>
    </div>
  );
};

export default Services;
