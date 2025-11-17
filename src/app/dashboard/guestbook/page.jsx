"use client";
import React, { useState } from "react";
import Table from "@/components/guestbook/Table";
import DateAndMonthFilter from "@/components/common/DateAndMonthFilter";
import { Button } from "@/components/ui/button";
import AddGuestForm from "@/components/guestbook/AddGuestForm";

const Guest = () => {
  const [openForm, setOpenForm] = useState(false);
  return (
    <div>
      <div className="flex justify-between items-center gap-10">
        <h1 className="section-heading">Guest Book</h1>

        <div className="flex items-center gap-5">
          <Button variant={"outline"} className={"border-2 h-14 text-lg"}>
            CSV Export
          </Button>

          <Button variant={"outline"} className={"border-2 h-14 text-lg"}>
            CSV Import
          </Button>

          <AddGuestForm isOpen={openForm} onOpenChange={setOpenForm} />

          <DateAndMonthFilter />
        </div>
      </div>
      <div className="mt-10">
        <Table />
      </div>
    </div>
  );
};

export default Guest;
