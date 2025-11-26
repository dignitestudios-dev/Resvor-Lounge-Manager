import React from "react";

export default function EventCards({ events }) {
  if (!events.length) {
    return <p className="text-gray-500">No events for this date.</p>;
  }
  return (
    <div className="flex flex-col gap-4">
      {events.map((event, idx) => (
        <div
          key={idx}
          className="rounded-xl p-4 text-black shadow"
          style={{
            background: "linear-gradient(90deg, #E8E8FF 0%, #FFFFFF00 100%)",
          }}
        >
          <div className="flex justify-between items-center py-2 mb-2 border-b-[1px] border-b-[#01005924]">
            <span className="font-bold text-[14px]">{event.eventName}</span>
            <span className="font-medium text-[12px]">
              Ticket Door: {event.ticketDoor}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm mb-2 py-2 border-b-[1px] border-b-[#01005924]">
            <div className="flex flex-col">
              <div className="text-[12px] text-[#656565]">Event Type</div>
              <div>{event.eventType}</div>
            </div>
            <div className="flex flex-col">
              <div className="text-[12px] text-[#656565]">Event Date</div>

              <div>{new Date(event.eventDate).toLocaleDateString()}</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm mb-2 py-2 border-b-[1px] border-b-[#01005924]">
            <div className="flex flex-col">
              <div className="text-[12px] text-[#656565]">Event Time</div>
              <div> {event.eventTime}</div>
            </div>
            <div className="flex flex-col">
              <div className="text-[12px] text-[#656565]">Guest Limit</div>

              <div>{event.guestLimit}</div>
            </div>
          </div>
          <div className="flex items-center mt-2">
            <img
              src={event.user.profile}
              alt={event.user.name}
              className="w-8 h-8 rounded-full mr-2 border-2 border-white"
            />
            <span className="font-medium">{event.user.name}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
