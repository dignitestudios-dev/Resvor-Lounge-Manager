"use client";
import Table from "@/components/bookings/Table";
import DateAndMonthFilter from "@/components/common/DateAndMonthFilter";
import React, { useMemo } from "react";
import { useGetBookings } from "@/lib/hooks/queries/useBookings";
import { useListingUrlParams } from "@/lib/hooks/useListingUrlParams";

const Bookings = () => {
  const { page: currentPage, getParam, setPage: setCurrentPage, setParams } = useListingUrlParams({
    page: 1,
    status: "",
    startDate: "",
    endDate: "",
    month: "",
    lounge: "",
  });

  const filters = useMemo(
    () => ({
      startDate: getParam("startDate", ""),
      endDate: getParam("endDate", ""),
      selectedMonth: getParam("month", ""),
      selectedLounge: getParam("lounge", ""),
      selectedStatus: getParam("status", ""),
    }),
    [getParam]
  );

  const { data: bookingsResponse, isLoading } = useGetBookings(
    currentPage,
    10,
    filters.startDate || undefined,
    filters.endDate || undefined,
    filters.selectedStatus || undefined,
  );

  const handleFilterChange = (filterData) => {
    setParams(
      {
        startDate: filterData.startDate || "",
        endDate: filterData.endDate || "",
        month: filterData.selectedMonth || "",
        lounge: filterData.selectedLounge || "",
        status: filterData.selectedStatus || "",
      },
      { resetPage: true }
    );
  };

  const totalRecords =
    bookingsResponse?.pagination?.totalDocs ??
    bookingsResponse?.pagination?.total ??
    bookingsResponse?.pagination?.totalBookings ??
    (bookingsResponse?.data || []).length;

  return (
    <div>
      <div className="flex justify-between items-center gap-10 mt-2">
        <h1 className="section-heading">Bookings</h1>

        <div>
          <DateAndMonthFilter
            isLounge={true}
            initialValues={filters}
            onFilterChange={handleFilterChange}
            statusOptions={[
              "awaiting_payment",
              "pending",
              "accepted",
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
          totalRecords={totalRecords}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
};

export default Bookings;
