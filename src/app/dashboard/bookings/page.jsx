"use client";
import Table from "@/components/bookings/Table";
import DateAndMonthFilter from "@/components/common/DateAndMonthFilter";
import React, { useState } from "react";
import { useGetBookings } from "@/lib/hooks/queries/useBookings";

const Bookings = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    selectedMonth: "",
    selectedLounge: "",
    selectedStatus: "",
  });

  const { data: bookingsResponse, isLoading } = useGetBookings(
    currentPage,
    10,
    filters.startDate || undefined,
    filters.endDate || undefined,
    filters.selectedStatus || undefined,
  );

  const handleFilterChange = (filterData) => {
    setFilters(filterData);
    setCurrentPage(1); // Reset to first page on filter change
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div>
      <div className="flex justify-between items-center gap-10 mt-2">
        <h1 className="section-heading">Bookings</h1>

        <div>
          <DateAndMonthFilter
            isLounge={true}
            onFilterChange={handleFilterChange}
            statusOptions={[
              "pending",
              "awaiting_payment",
              "confirmed",
              "failed",
              "cancelled",
              "rejected",
              "completed",
            ]}
          />
        </div>
      </div>

      <div className="mt-6">
        <Table
          filters={filters}
          bookings={bookingsResponse?.data || []}
          isLoading={isLoading}
          currentPage={currentPage}
          totalPages={bookingsResponse?.pagination?.totalPages || 1}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default Bookings;
