import Table from "@/components/bookings/Table";
import DateAndMonthFilter from "@/components/common/DateAndMonthFilter";
import React from "react";

const Bookings = () => {
  return (
    <div>
      <div className="flex justify-between items-center gap-10">
        <h1 className="section-heading">Bookings</h1>

        <div>
          <DateAndMonthFilter />
        </div>
      </div>

      <div className="mt-10">
        <Table />
      </div>
    </div>
  );
};

export default Bookings;
