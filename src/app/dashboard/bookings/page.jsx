"use client";
import Table from "@/components/bookings/Table";
import DateAndMonthFilter from "@/components/common/DateAndMonthFilter";
import React, { useState } from "react";

const Bookings = () => {
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
        <h1 className="section-heading">Bookings</h1>

        <div>
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

export default Bookings;
