import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { IoIosArrowForward } from "react-icons/io";
import utils, { capitalize } from "@/lib/utils";

export default function EventCards({ events = [] }) {
  const router = useRouter();

  if (!events.length) {
    return (
      <div className="py-8 text-center text-gray-500">
        <p className="text-sm font-medium">No events found for this selection.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {events.map((event, idx) => (
        <div
          key={event._id || idx}
          onClick={() => event._id && router.push(`/dashboard/event-management/${event._id}`)}
          className="rounded-xl p-4 text-black shadow hover:shadow-md transition-shadow cursor-pointer"
          style={{
            background: "linear-gradient(90deg, #E8E8FF 0%, #FFFFFF00 100%)",
          }}
        >
          <div className="flex justify-between items-center py-2 mb-2 border-b-[1px] border-b-[#01005924]">
            <span className="font-bold text-[14px]">{event.eventName || event.title}</span>
            <span className="font-medium text-[12px] text-gray-700">
              Budget: ${event.budget || event.ticketDoor || 0}
            </span>
          </div>

          <div className="grid grid-cols-2 text-sm mb-2 py-2 border-b-[1px] border-b-[#01005924]">
            <div className="flex flex-col">
              <div className="text-[12px] text-[#656565]">Event Type</div>
              <div className="font-medium">{capitalize(event.eventType)}</div>
            </div>
            <div className="flex flex-col border-l-2 border-gray-300 pl-4">
              <div className="text-[12px] text-[#656565]">Event Date</div>
              <div className="font-medium">{utils.formatDateWithName(event.eventDate || event.startDateTime)}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 text-sm mb-2 py-2 border-b-[1px] border-b-[#01005924]">
            <div className="flex flex-col">
              <div className="text-[12px] text-[#656565]">Event Time</div>
              <div className="font-medium">{event.eventTime}</div>
            </div>
            <div className="flex flex-col border-l-2 border-gray-300 pl-4">
              <div className="text-[12px] text-[#656565]">Guest Limit</div>
              <div className="font-medium">{event.guestLimit || event.guestCount || 0}</div>
            </div>
          </div>

          <div className="flex items-center gap-5 justify-between">
            <div className="flex items-center mt-2">
              <span className="font-medium text-sm text-gray-800">
                {event.guestName || event.user?.name || "Guest"}
              </span>
            </div>

            <Button variant="ghost" className="p-2 hover:bg-white/60">
              <IoIosArrowForward size={20} className="text-[#0d0d6b]" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
