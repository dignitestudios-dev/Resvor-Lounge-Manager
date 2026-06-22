"use client";
import React, { useState } from "react";
import Table from "@/components/guestbook/Table";
import DateAndMonthFilter from "@/components/common/DateAndMonthFilter";
import { Button } from "@/components/ui/button";
import AddGuestForm from "@/components/guestbook/AddGuestForm";
import { useGetGuestbook } from "@/lib/hooks/queries/useGuestbook";

const Guest = () => {
  const [openForm, setOpenForm] = useState(false);

  // Pagination state
  const [page, setPage] = useState(1);

  // Date filter state — empty string means "no filter" (not sent to API)
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { data: guestbookData, isLoading } = useGetGuestbook({
    page,
    startDate,
    endDate,
  });

  const guests = guestbookData?.data || [];
  const pagination = guestbookData?.pagination || null;

  const handleFilterChange = ({ startDate: sd, endDate: ed }) => {
    setStartDate(sd || "");
    setEndDate(ed || "");
    setPage(1); // reset to first page on every filter change
  };

  return (
    <div>
      <div className="flex justify-between items-center gap-10 mt-2">
        <h1 className="section-heading">Guest Book</h1>

        <div className="flex items-center gap-5 ">
          <Button
            variant={"outline"}
            className={"border-2 h-12 text-[14px] px-6"}
          >
            CSV Export
          </Button>

          <Button
            variant={"outline"}
            className={"border-2 h-12 text-[14px] px-6"}
          >
            CSV Import
          </Button>

          <AddGuestForm isOpen={openForm} onOpenChange={setOpenForm} />

          <DateAndMonthFilter onFilterChange={handleFilterChange} />
        </div>
      </div>
      <div className="mt-4">
        <Table
          guests={guests}
          isLoading={isLoading}
          pagination={pagination}
          onPageChange={setPage}
          currentPage={page}
        />
      </div>
    </div>
  );
};

export default Guest;
