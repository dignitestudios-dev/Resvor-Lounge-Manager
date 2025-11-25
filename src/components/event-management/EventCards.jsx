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
          <div className="flex justify-between items-center mb-2">
            <span className="font-bold text-lg">{event.eventName}</span>
            <span className="font-semibold">
              Ticket Door: {event.ticketDoor}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm mb-2">
            <div>Event Type: {event.eventType}</div>
            <div>
              Event Date: {new Date(event.eventDate).toLocaleDateString()}
            </div>
            <div>Event Time: {event.eventTime}</div>
            <div>Guest Limit: {event.guestLimit}</div>
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
