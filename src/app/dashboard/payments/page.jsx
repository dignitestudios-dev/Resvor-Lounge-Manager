"use client";
import DateAndMonthFilter from "@/components/common/DateAndMonthFilter";
import Table from "@/components/payments/Table";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";

const Payments = () => {
  const [activeTab, setActiveTab] = useState("booking");

  // Booking Payment Data
  const bookingPayments = [
    {
      clientName: "Christine Easom",
      email: "christine.easom@gmail.com",
      contact: "+000 0000 000",
      paymentDate: "2025-01-02T00:00:00.000Z",
      amount: 400,
    },
    {
      clientName: "John Smith",
      email: "john.smith@yahoo.com",
      contact: "+111 2222 333",
      paymentDate: "2025-01-03T00:00:00.000Z",
      amount: 250,
    },
    {
      clientName: "Sarah Johnson",
      email: "sarah.j@outlook.com",
      contact: "+444 5555 666",
      paymentDate: "2025-01-05T00:00:00.000Z",
      amount: 600,
    },
    {
      clientName: "Mike Wilson",
      email: "mike.wilson@gmail.com",
      contact: "+777 8888 999",
      paymentDate: "2025-01-07T00:00:00.000Z",
      amount: 350,
    },
    {
      clientName: "Emily Davis",
      email: "emily.davis@hotmail.com",
      contact: "+123 4567 890",
      paymentDate: "2025-01-08T00:00:00.000Z",
      amount: 480,
    },
    {
      clientName: "Robert Brown",
      email: "robert.b@protonmail.com",
      contact: "+234 5678 901",
      paymentDate: "2025-01-10T00:00:00.000Z",
      amount: 720,
    },
    {
      clientName: "Lisa Anderson",
      email: "lisa.anderson@gmail.com",
      contact: "+345 6789 012",
      paymentDate: "2025-01-12T00:00:00.000Z",
      amount: 300,
    },
    {
      clientName: "David Miller",
      email: "david.miller@yahoo.com",
      contact: "+456 7890 123",
      paymentDate: "2025-01-15T00:00:00.000Z",
      amount: 550,
    },
    {
      clientName: "Jennifer Taylor",
      email: "jennifer.t@gmail.com",
      contact: "+567 8901 234",
      paymentDate: "2025-01-18T00:00:00.000Z",
      amount: 420,
    },
    {
      clientName: "Kevin Martin",
      email: "kevin.martin@outlook.com",
      contact: "+678 9012 345",
      paymentDate: "2025-01-20T00:00:00.000Z",
      amount: 680,
    },
  ];

  // Events Payment Data
  const eventsPayments = [
    {
      clientName: "Christine Easom",
      email: "christine.easom@gmail.com",
      event: "Birthday",
      eventDate: "2025-01-02T00:00:00.000Z",
      paymentDate: "2025-01-02T00:00:00.000Z",
      amount: 400,
    },
    {
      clientName: "John Smith",
      email: "john.smith@yahoo.com",
      event: "Wedding",
      eventDate: "2025-01-03T00:00:00.000Z",
      paymentDate: "2025-01-02T00:00:00.000Z",
      amount: 1200,
    },
    {
      clientName: "Sarah Johnson",
      email: "sarah.j@outlook.com",
      event: "Corporate Event",
      eventDate: "2025-01-05T00:00:00.000Z",
      paymentDate: "2025-01-04T00:00:00.000Z",
      amount: 2500,
    },
    {
      clientName: "Mike Wilson",
      email: "mike.wilson@gmail.com",
      event: "Anniversary",
      eventDate: "2025-01-07T00:00:00.000Z",
      paymentDate: "2025-01-06T00:00:00.000Z",
      amount: 800,
    },
    {
      clientName: "Emily Davis",
      email: "emily.davis@hotmail.com",
      event: "Baby Shower",
      eventDate: "2025-01-08T00:00:00.000Z",
      paymentDate: "2025-01-07T00:00:00.000Z",
      amount: 600,
    },
    {
      clientName: "Robert Brown",
      email: "robert.b@protonmail.com",
      event: "Conference",
      eventDate: "2025-01-10T00:00:00.000Z",
      paymentDate: "2025-01-09T00:00:00.000Z",
      amount: 3500,
    },
    {
      clientName: "Lisa Anderson",
      email: "lisa.anderson@gmail.com",
      event: "Dinner Party",
      eventDate: "2025-01-12T00:00:00.000Z",
      paymentDate: "2025-01-11T00:00:00.000Z",
      amount: 450,
    },
    {
      clientName: "David Miller",
      email: "david.miller@yahoo.com",
      event: "Product Launch",
      eventDate: "2025-01-15T00:00:00.000Z",
      paymentDate: "2025-01-14T00:00:00.000Z",
      amount: 1800,
    },
    {
      clientName: "Jennifer Taylor",
      email: "jennifer.t@gmail.com",
      event: "Graduation Party",
      eventDate: "2025-01-18T00:00:00.000Z",
      paymentDate: "2025-01-17T00:00:00.000Z",
      amount: 700,
    },
    {
      clientName: "Kevin Martin",
      email: "kevin.martin@outlook.com",
      event: "Networking Event",
      eventDate: "2025-01-20T00:00:00.000Z",
      paymentDate: "2025-01-19T00:00:00.000Z",
      amount: 950,
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center gap-10 mt-2">
        <div className="flex items-center gap-8">
          <h1 className="section-heading">Payments</h1>

          <div className="flex">
            <Button
              variant={"ghost"}
              className={`rounded-none hover:text-primary ${
                activeTab === "booking"
                  ? "border-b-2 border-primary text-primary"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("booking")}
            >
              Booking Payment
            </Button>
            <Button
              variant={"ghost"}
              className={`rounded-none hover:text-primary ${
                activeTab === "events"
                  ? "border-b-2 border-primary text-primary"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("events")}
            >
              Events Payment
            </Button>
          </div>
        </div>
        <DateAndMonthFilter />
      </div>

      {/* Tabs */}
      <div className="mt-6">
        <Table
          data={activeTab === "booking" ? bookingPayments : eventsPayments}
          type={activeTab}
        />
      </div>
    </div>
  );
};

export default Payments;
