"use client";
import React, { useState } from "react";
import Table from "@/components/bartender/Table";
import AddBartenderForm from "@/components/bartender/AddBartenderForm";

const Bartenders = () => {
  const [openForm, setOpenForm] = useState(false);

  return (
    <div>
      <div className="flex justify-between items-center gap-10 mt-2">
        <h1 className="section-heading">Workforce Management</h1>

        <div className="flex items-center gap-5">
          <AddBartenderForm isOpen={openForm} onOpenChange={setOpenForm} />
        </div>
      </div>

      <div className="mt-4">
        <Table />
      </div>
    </div>
  );
};

export default Bartenders;
