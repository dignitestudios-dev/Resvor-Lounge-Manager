"use client"
import React, { useState } from "react";
import Table from "@/components/shifts-and-scheduling/Table";
import AddShiftAndScheduling from "@/components/shifts-and-scheduling/AddShiftAndScheduling";

const ShiftsAndScheduling = () => {
  const [openForm, setOpenForm] = useState(false);

  return (
    <div>
      <div className="flex justify-between items-center gap-10">
        <h1 className="section-heading">Shifts & Scheduling</h1>

        <div className="flex items-center gap-5">
          <AddShiftAndScheduling isOpen={openForm} onOpenChange={setOpenForm} />
        </div>
      </div>
      <div className="mt-10">
        <Table />
      </div>
    </div>
  );
};

export default ShiftsAndScheduling;
