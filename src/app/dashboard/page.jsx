"use client";

import React, { useState } from "react";
import StatsCard from "@/components/dashboard/StatsCard";
import Table from "@/components/dashboard/Table";
import DateAndMonthFilter from "@/components/common/DateAndMonthFilter";
import { useGetDashboard } from "@/lib/hooks/queries/useDashboard";
import Guestbook from "@/components/icons/sidebar/guestbook";
import EventManagement from "@/components/icons/sidebar/event-management";
import Bookings from "@/components/icons/sidebar/bookings";
import utils from "@/lib/utils";

const Dashboard = () => {
  const [filterDates, setFilterDates] = useState({
    startDate: "",
    endDate: "",
  });

  const { data: dashboardResponse, isLoading } = useGetDashboard({
    startDate: filterDates.startDate,
    endDate: filterDates.endDate,
  });

  const stats = dashboardResponse?.stats || {};
  const items = dashboardResponse?.data || [];
  const pagination = dashboardResponse?.pagination || {};

  const handleFilterChange = (filters) => {
    setFilterDates({
      startDate: filters.startDate || "",
      endDate: filters.endDate || "",
    });
  };

  const statsData = [
    {
      title: "Total Bartenders",
      value: isLoading ? "—" : utils.formatNumber(stats?.totalBartenders ?? 0),
      icon: <Guestbook size={34} />,
    },
    {
      title: "Upcoming Events",
      value: isLoading ? "—" : utils.formatNumber(stats?.upcomingEventsCount ?? 0),
      icon: <EventManagement size={28} />,
    },
    {
      title: "Recent Bookings",
      value: isLoading ? "—" : utils.formatNumber(stats?.recentBookingsCount ?? 0),
      icon: <Bookings size={28} />,
    },
    {
      title: "Completed Bookings",
      value: isLoading ? "—" : utils.formatNumber(stats?.completedBookingsCount ?? 0),
      icon: <Bookings size={28} />,
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center gap-10">
        <h1 className="section-heading">Dashboard</h1>

        <div>
          <DateAndMonthFilter onFilterChange={handleFilterChange} />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statsData.map((stat, index) => (
          <StatsCard key={index} stats={stat} />
        ))}
      </div>

      <div className="mt-10">
        <Table data={items} isLoading={isLoading} pagination={pagination} />
      </div>
    </div>
  );
};

export default Dashboard;
