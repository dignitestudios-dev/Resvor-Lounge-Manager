"use client";
import React from "react";
import { useParams } from "next/navigation";
import { useGetBookingDetail } from "@/lib/hooks/queries/useBookingDetail";
import utils, { getBookingStatusStyles } from "@/lib/utils";

const BookingDetails = () => {
  const params = useParams();
  const bookingId = params.id;

  const { data: bookingData, isLoading } = useGetBookingDetail(bookingId);

  if (isLoading) {
    return (
      <div className="flex-1 flex justify-center items-center">
        <div className="text-lg font-semibold">Loading booking details...</div>
      </div>
    );
  }

  if (!bookingData) {
    return (
      <div className="flex-1 flex justify-center items-center">
        <div className="text-lg font-semibold text-red-600">
          Booking not found
        </div>
      </div>
    );
  }

  // Parse dates and times
  const startTime = new Date(bookingData.startTime);
  const endTime = new Date(bookingData.endTime);
  const bookingDate = utils.formatDateWithName(bookingData.bookingDate);
  const startTimeFormatted = utils.formatTime(startTime);
  const endTimeFormatted = utils.formatTime(endTime);
  const tableInfo = bookingData.tableIds?.[0] || {};
  const userName =
    `${bookingData.userId?.firstName || ""} ${bookingData.userId?.lastName || ""}`.trim() ||
    "Unknown";

  return (
    <div className="flex-1 flex flex-col overflow-y-auto">
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-2xl font-bold">Booking Details</h1>
        {bookingData?.status && (
          <span
            className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${getBookingStatusStyles(
              bookingData.status,
            )}`}
          >
            {utils.capitalize(bookingData.status.replaceAll("_", " "))}
          </span>
        )}
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
                <h3 className="text-xl font-bold mb-2">
                  {bookingData.loungeId?.name || "Unknown Lounge"}
                </h3>
                <div className="flex gap-2 mb-4">
                  <span className="bg-blue-800/20 text-blue-950 px-3 py-1 rounded-full text-sm font-medium">
                    Booking
                  </span>
                  <span className="bg-blue-800/20 text-blue-950 px-3 py-1 rounded-full text-sm font-medium">
                    Active
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <span className="text-lg">📍</span>
                  <span>{bookingData.loungeId?.name || "Unknown Lounge"}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-6 py-5">
              <div>
                <p className="text-gray-600 text-sm font-semibold mb-2">
                  Check-in Date
                </p>
                <p className="text-black font-semibold">{bookingDate}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm font-semibold mb-2">
                  Check-in Time
                </p>
                <p className="text-black font-semibold">{startTimeFormatted}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm font-semibold mb-2">
                  Check-out Time
                </p>
                <p className="text-black font-semibold">{endTimeFormatted}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm font-semibold mb-2">
                  Guest Count
                </p>
                <p className="text-black font-semibold">
                  {bookingData.guestCount} Guests
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm font-semibold mb-2">
                  Table
                </p>
                <p className="text-black font-semibold">
                  {tableInfo.code || "N/A"}
                </p>
              </div>
            </div>

            <div className="border-t pt-6 mb-8">
              <div className="grid grid-cols-2 gap-12">
                <div>
                  <p className="text-gray-600 text-sm font-semibold mb-2">
                    Table Details
                  </p>
                  <p className="text-black font-semibold">
                    Type: {tableInfo.type || "N/A"}
                  </p>
                  <p className="text-black font-semibold">
                    Capacity: {tableInfo.capacity || "N/A"}
                  </p>
                </div>
                <div className="border-l pl-12">
                  <p className="text-gray-600 text-sm font-semibold mb-2">
                    Payment Status
                  </p>
                  <p className="text-black font-semibold">
                    {utils.capitalize(bookingData.paymentStatus || "N/A")}
                  </p>
                  <p className="text-gray-600 text-sm font-semibold">
                    Amount Paid: ${bookingData.amountPaid || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <p className="text-gray-600 text-sm font-semibold mb-3">
                Any Special Requests{" "}
                <span className="text-gray-400 font-normal">(Optional)</span>
              </p>
              <p className="text-gray-700 leading-relaxed text-sm">
                {bookingData.specialRequest || "No special requests provided"}
              </p>
            </div>
          </div>

          <h2 className="text-lg font-bold mb-3">User Information</h2>

          <div className="bg-white rounded-2xl p-6">
            <div className="grid grid-cols-3 gap-12">
              <div>
                <p className="text-gray-600 text-sm font-semibold mb-2">Name</p>
                <p className="text-black font-semibold">{userName}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm font-semibold mb-2">
                  Email Address
                </p>
                <p className="text-black font-semibold">
                  {bookingData.userId?.email || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm font-semibold mb-2">
                  Phone Number
                </p>
                <p className="text-black font-semibold">
                  {bookingData.userId?.phone || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetails;
