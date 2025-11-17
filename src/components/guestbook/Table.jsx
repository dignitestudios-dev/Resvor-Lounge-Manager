"use client";
import React from "react";
import { IoIosArrowForward } from "react-icons/io";
import utils from "@/lib/utils";
import { useRouter } from "next/navigation";

const Table = () => {
  const router = useRouter();
  const guests = [
    {
      guestName: "John Doe",
      guestEmail: "johndoe@gmail.com",
      guestNumber: "+1 202-555-0123",
      birthday: "1990-05-12T00:00:00Z",
    },
    {
      guestName: "Jane Smith",
      guestEmail: "janesmith@example.com",
      guestNumber: "+1 312-555-0456",
      birthday: "1988-09-23T00:00:00Z",
    },
    {
      guestName: "Michael Johnson",
      guestEmail: "michael.johnson@email.com",
      guestNumber: "+1 415-555-0789",
      birthday: "1995-03-17T00:00:00Z",
    },
    {
      guestName: "Emily Davis",
      guestEmail: "emily.davis@outlook.com",
      guestNumber: "+1 646-555-0145",
      birthday: "1992-12-05T00:00:00Z",
    },
    {
      guestName: "Robert Wilson",
      guestEmail: "robertwilson@gmail.com",
      guestNumber: "+1 702-555-0933",
      birthday: "1985-07-21T00:00:00Z",
    },
    {
      guestName: "Olivia Martinez",
      guestEmail: "olivia.martinez@domain.com",
      guestNumber: "+1 617-555-0234",
      birthday: "1993-11-11T00:00:00Z",
    },
    {
      guestName: "James Brown",
      guestEmail: "james.brown@samplemail.com",
      guestNumber: "+1 303-555-0678",
      birthday: "1991-08-30T00:00:00Z",
    },
    {
      guestName: "Sophia Turner",
      guestEmail: "sophia.turner@mail.com",
      guestNumber: "+1 213-555-0199",
      birthday: "1994-02-14T00:00:00Z",
    },
    {
      guestName: "William Anderson",
      guestEmail: "will.anderson@gmail.com",
      guestNumber: "+1 512-555-0345",
      birthday: "1987-06-03T00:00:00Z",
    },
    {
      guestName: "Ava Clark",
      guestEmail: "ava.clark@demo.com",
      guestNumber: "+1 480-555-0721",
      birthday: "1996-10-19T00:00:00Z",
    },
  ];

  const handleGoToGuestDetailsPage = (guestId) => {
    router.push(`/dashboard/guestbook/${guestId}`);
  };

  return (
    <div className="bg-white rounded-xl overflow-y-auto">
      <table className="w-full">
        <thead className="sticky top-0 z-10">
          <tr className="bg-[#E8E8FF]">
            <th className="px-4 py-5 text-left text-nowrap">Guest Name</th>
            <th className="px-4 py-5 text-left text-nowrap">Guest Email</th>
            <th className="px-4 py-5 text-left text-nowrap">Guest Number</th>
            <th className="px-4 py-5 text-left text-nowrap">Birthday</th>
            <th className="px-4 py-5 text-center text-nowrap">Action</th>
          </tr>
        </thead>
        <tbody>
          {guests.map((guest, index) => (
            <tr
              onClick={() => handleGoToGuestDetailsPage(index)}
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
                  {guest.guestName}{" "}
                </div>
              </td>
              <td className="px-4 py-6">{guest.guestEmail}</td>
              <td className="px-4 py-6">{guest.guestNumber}</td>
              <td className="px-4 py-6">
                {utils.formatDateWithName(guest.birthday)}
              </td>
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
