"use client";
import React from "react";
import CustomPagination from "./CustomPagination";

const Table = () => {
  const users = [
    {
      name: "John Doe",
      email: "johndoe@gmail.com",
      phone: "+1 202-555-0123",
      location: "Dallas, TX – 802 PainEase Plaza",
      status: "Active",
    },
    {
      name: "Jane Smith",
      email: "janesmith@example.com",
      phone: "+1 312-555-0456",
      location: "Chicago, IL – 1204 Windy Lane",
      status: "Active",
    },
    {
      name: "Michael Johnson",
      email: "michael.johnson@email.com",
      phone: "+1 415-555-0789",
      location: "San Francisco, CA – 55 Market Street",
      status: "Active",
    },
    {
      name: "Emily Davis",
      email: "emily.davis@outlook.com",
      phone: "+1 646-555-0145",
      location: "New York, NY – 9 Empire Blvd",
      status: "Inactive",
    },
    {
      name: "Robert Wilson",
      email: "robertwilson@gmail.com",
      phone: "+1 702-555-0933",
      location: "Las Vegas, NV – 450 Sunset Avenue",
      status: "Active",
    },
    {
      name: "Olivia Martinez",
      email: "olivia.martinez@domain.com",
      phone: "+1 617-555-0234",
      location: "Boston, MA – 132 Beacon Street",
      status: "Inactive",
    },
    {
      name: "James Brown",
      email: "james.brown@samplemail.com",
      phone: "+1 303-555-0678",
      location: "Denver, CO – 78 Rocky Road",
      status: "Active",
    },
    {
      name: "Sophia Turner",
      email: "sophia.turner@mail.com",
      phone: "+1 213-555-0199",
      location: "Los Angeles, CA – 901 Hollywood Blvd",
      status: "Active",
    },
    {
      name: "William Anderson",
      email: "will.anderson@gmail.com",
      phone: "+1 512-555-0345",
      location: "Austin, TX – 300 Tech Park Drive",
      status: "Inactive",
    },
    {
      name: "Ava Clark",
      email: "ava.clark@demo.com",
      phone: "+1 480-555-0721",
      location: "Phoenix, AZ – 18 Desert View Lane",
      status: "Active",
    },
  ];

  const onPageChange = (page) => {
    // getAllUsers(page);
  };

  return (
    <CustomPagination
      loading={false}
      onPageChange={onPageChange}
      totalPages={10}
    >
      <div className="bg-white rounded-xl overflow-y-auto">
        <table className="w-full">
          <thead className="sticky top-0 z-10">
            <tr className="bg-[#E8E8FF]">
              <th className="px-4 py-5 text-left text-nowrap">#</th>
              <th className="px-4 py-5 text-left text-nowrap">Name</th>
              <th className="px-4 py-5 text-left text-nowrap">Email Address</th>
              <th className="px-4 py-5 text-left text-nowrap">Phone Number</th>
              <th className="px-4 py-5 text-left text-nowrap">Location</th>
              <th className="px-4 py-5 text-left text-nowrap">Status</th>
              <th className="px-4 py-5 text-left text-nowrap">Action</th>
            </tr>
          </thead>
          <tbody className="mt-10">
            {users.map((user, index) => (
              <tr key={index} className="border-b border-[#D4D4D4]">
                <td className="px-4 py-6">{index + 1}</td>
                <td className="px-4 py-6">
                  <div className="flex items-center gap-3">
                    <div className="p-0.5 bg-linear-to-bl from-[#29ABE2] to-[#63CFAC] rounded-full">
                      <div
                        className="h-[43px] w-[43px] rounded-full bg-cover bg-center border border-white"
                        style={{
                          backgroundImage: `url(${"/images/profile.jpg"})`,
                        }}
                      />
                    </div>
                    {user.name}
                  </div>
                </td>
                <td className="px-4 py-6">{user.email}</td>
                <td className="px-4 py-6 text-nowrap">{user.phone}</td>
                <td className="px-4 py-6">{user.location}</td>
                <td
                  className={`px-4 py-6 ${
                    user.status === "Active"
                      ? "text-[#85D500]"
                      : "text-[#EE0004]"
                  }`}
                >
                  {user.status}
                </td>
                <td className="px-4 py-6 text-nowrap underline cursor-pointer">
                  View Details
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </CustomPagination>
  );
};

export default Table;
