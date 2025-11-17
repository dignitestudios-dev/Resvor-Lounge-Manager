"use client";
import React from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";

const EventDetails = () => {
  const params = useParams();
  const eventId = params.id;

  const handleReject = () => {
    console.log("Event ID:", eventId, "Action: Rejected");
  };

  const handleAccept = () => {
    console.log("Event ID:", eventId, "Action: Accepted");
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto">
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-2xl font-bold">Event Details</h1>
        <div className="flex gap-3">
          <Button
            onClick={handleReject}
            className="bg-red-600 hover:bg-red-700 w-36 font-medium text-lg"
          >
            Reject
          </Button>
          <Button
            onClick={handleAccept}
            className="bg-green-500 hover:bg-green-600 w-36 font-medium text-lg"
          >
            Accept
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-white p-5 rounded-2xl">
        <div className="bg-[#F5F5F5] rounded-2xl p-5">
          <h2 className="text-lg font-bold mb-3">Reservation Details</h2>

          <div className="bg-white rounded-2xl p-6 mb-6">
            <div className="flex gap-6 mb-8">
              <div
                className="w-56 h-40 rounded-2xl bg-cover bg-center shrink-0"
                style={{
                  backgroundImage: "url(/images/lounge.jfif)",
                }}
              />

              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">Highbar Rooftop NYC</h3>
                <div className="flex gap-2 mb-4">
                  <span className="bg-blue-800/20 text-blue-950 px-3 py-1 rounded-full text-sm font-medium">
                    Rooftop
                  </span>
                  <span className="bg-blue-800/20 text-blue-950 px-3 py-1 rounded-full text-sm font-medium">
                    BAR
                  </span>
                  <span className="bg-blue-800/20 text-blue-950 px-3 py-1 rounded-full text-sm font-medium">
                    Bottle Service
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <span className="text-lg">📍</span>
                  <span>Times Square, New York, NY</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-6 py-5">
              <div>
                <p className="text-gray-600 text-sm font-semibold mb-2">
                  Event Type
                </p>
                <p className="text-black font-semibold">Birthday Party</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm font-semibold mb-2">
                  Check-in Date
                </p>
                <p className="text-black font-semibold">26 Dec, 2024</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm font-semibold mb-2">
                  Check-in Time
                </p>
                <p className="text-black font-semibold">06:00 PM</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm font-semibold mb-2">
                  Check-out Time
                </p>
                <p className="text-black font-semibold">10:00 PM</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm font-semibold mb-2">
                  Guest Count
                </p>
                <p className="text-black font-semibold">30 Guests</p>
              </div>

              {/* Second row - 4 columns */}
              <div>
                <p className="text-gray-600 text-sm font-semibold mb-2">
                  Preferred Music
                </p>
                <p className="text-black font-semibold">Hip Hop, REB, Rock</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm font-semibold mb-2">
                  Special Request
                </p>
                <p className="text-black font-semibold">Birthday Signage</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm font-semibold mb-2">
                  Budget
                </p>
                <p className="text-black font-semibold">$1000</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm font-semibold mb-2">
                  Ticket at Door{" "}
                  <span className="text-gray-400 font-normal">(optional)</span>
                </p>
                <p className="text-black font-semibold">None</p>
              </div>
            </div>

            <div className="border-t pt-6 mb-8">
              <div className="grid grid-cols-2 gap-12">
                <div>
                  <p className="text-gray-600 text-sm font-semibold mb-2">
                    Services and Packages
                  </p>
                  <p className="text-black font-semibold">
                    Food and Drink Package
                  </p>
                  <p className="text-black font-semibold">Bottle Package</p>
                </div>
                <div className="border-l pl-12">
                  <p className="text-gray-600 text-sm font-semibold mb-2">
                    Preferred Seating Area
                  </p>
                  <p className="text-black font-semibold">
                    Outdoor Terrace/ Rooftop
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <p className="text-gray-600 text-sm font-semibold mb-3">
                Any Instructions{" "}
                <span className="text-gray-400 font-normal">(Optional)</span>
              </p>
              <p className="text-gray-700 leading-relaxed text-sm">
                The standard Lorem Ipsum passage, m ipsum dolor sit amet,
                cectetur adipiscing elit, sed do eiusm. The standard Lorem Ipsum
                passage, m ipsum dolor sit amet, cectetur adipiscing elit, sed
                do eiusm. The standard.The standard Lorem Ipsum passage, m ipsum
                dolor sit amet, cectetur adipiscing elit, sed do eiusm. The
                standard.
              </p>
            </div>
          </div>

          <h2 className="text-lg font-bold mb-3">User Information</h2>

          <div className="bg-white rounded-2xl p-6">
            <div className="grid grid-cols-3 gap-12">
              <div>
                <p className="text-gray-600 text-sm font-semibold mb-2">Name</p>
                <p className="text-black font-semibold">Mike Smith</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm font-semibold mb-2">
                  Email Address
                </p>
                <p className="text-black font-semibold">designer@gmail.com</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm font-semibold mb-2">
                  Phone Number
                </p>
                <p className="text-black font-semibold">+1 462 849 558</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
