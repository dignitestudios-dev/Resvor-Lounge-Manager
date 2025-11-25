"use client";
import { useRouter } from "next/navigation";
import React from "react";
import { IoIosArrowForward } from "react-icons/io";

const Table = () => {
  const router = useRouter();
  const bartenders = [
    {
      bartenderName: "John Doe",
      emailAddress: "johndoe@gmail.com",
      number: "+1 202-555-0123",
      address: "Dallas, TX – 802 PainEase Plaza",
      loungeName: "First Lounge",
    },
    {
      bartenderName: "Jane Smith",
      emailAddress: "janesmith@example.com",
      number: "+1 312-555-0456",
      address: "Chicago, IL – 1204 Windy Lane",
      loungeName: "First Lounge",
    },
    {
      bartenderName: "Michael Johnson",
      emailAddress: "michael.johnson@email.com",
      number: "+1 415-555-0789",
      address: "San Francisco, CA – 55 Market Street",
      loungeName: "Second Lounge",
    },
    {
      bartenderName: "Emily Davis",
      emailAddress: "emily.davis@outlook.com",
      number: "+1 646-555-0145",
      address: "New York, NY – 9 Empire Blvd",
      loungeName: "Second Lounge",
    },
    {
      bartenderName: "Robert Wilson",
      emailAddress: "robertwilson@gmail.com",
      number: "+1 702-555-0933",
      address: "Las Vegas, NV – 450 Sunset Avenue",
      loungeName: "First Lounge",
    },
    {
      bartenderName: "Olivia Martinez",
      emailAddress: "olivia.martinez@domain.com",
      number: "+1 617-555-0234",
      address: "Boston, MA – 132 Beacon Street",
      loungeName: "First Lounge",
    },
    {
      bartenderName: "James Brown",
      emailAddress: "james.brown@samplemail.com",
      number: "+1 303-555-0678",
      address: "Denver, CO – 78 Rocky Road",
      loungeName: "First Lounge",
    },
    {
      bartenderName: "Sophia Turner",
      emailAddress: "sophia.turner@mail.com",
      number: "+1 213-555-0199",
      address: "Los Angeles, CA – 901 Hollywood Blvd",
      loungeName: "First Lounge",
    },
    {
      bartenderName: "William Anderson",
      emailAddress: "will.anderson@gmail.com",
      number: "+1 512-555-0345",
      address: "Austin, TX – 300 Tech Park Drive",
      loungeName: "second Lounge",
    },
    {
      bartenderName: "Ava Clark",
      emailAddress: "ava.clark@demo.com",
      number: "+1 480-555-0721",
      address: "Phoenix, AZ – 18 Desert View Lane",
      loungeName: "second Lounge",
    },
  ];

  const handleGoToDetailsPage = (id) => {
    router.push(`/dashboard/bartenders/${id}`);
  };

  return (
    <div className="bg-white rounded-xl overflow-y-auto">
      <table className="w-full">
        <thead className="sticky top-0 z-10">
          <tr className="bg-[#E8E8FF]">
            <th className="px-4 py-5 text-left text-nowrap">Bartender Name</th>
            <th className="px-4 py-5 text-left text-nowrap">Email Address</th>
            <th className="px-4 py-5 text-left text-nowrap">Number</th>
            <th className="px-4 py-5 text-left text-nowrap">Lounge Name</th>
            <th className="px-4 py-5 text-left text-nowrap">Address</th>

            <th className="px-4 py-5 text-center text-nowrap">Action</th>
          </tr>
        </thead>
        <tbody>
          {bartenders.map((bartender, index) => (
            <tr
              onClick={() => handleGoToDetailsPage(index)}
              key={index}
              className="border-b border-[#D4D4D4] cursor-pointer"
            >
              <td className="px-4 py-6">
                <div className="flex items-center gap-3">
                  <div
                    className="h-[43px] w-[43px] rounded-full bg-cover bg-center bg-primary"
                    style={{
                      backgroundImage: `url(${"/images/profile.png"})`,
                    }}
                  />
                  {bartender?.bartenderName}
                </div>
              </td>
              <td className="px-4 py-6">{bartender?.emailAddress}</td>
              <td className="px-4 py-6">{bartender?.number}</td>
              <td className="px-4 py-6">{bartender?.loungeName}</td>

              <td className="px-4 py-6">{bartender?.address}</td>
              <td className="px-4 py-6 text-nowrap">
                <div className="flex justify-center items-center cursor-pointer">
                  <IoIosArrowForward size={24} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
