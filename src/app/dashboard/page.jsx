import React from "react";
import StatsCard from "@/components/dashboard/StatsCard";
import { dashboardStats } from "@/lib/constants";
import Table from "@/components/dashboard/Table";
import DateAndMonthFilter from "@/components/common/DateAndMonthFilter";

const Dashboard = () => {
  return (
    <div>
      <div className="flex justify-between items-center gap-10">
        <h1 className="section-heading">Dashboard</h1>

        <div>
          <DateAndMonthFilter />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-4 gap-5">
        {dashboardStats.map((stats, index) => (
          <StatsCard key={index} stats={stats} />
        ))}
      </div>

      <div className="mt-10">
        <Table />
      </div>
    </div>
  );
};

export default Dashboard;
