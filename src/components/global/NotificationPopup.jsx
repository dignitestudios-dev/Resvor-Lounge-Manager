import React from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "../ui/button";
import { IoNotificationsOutline } from "react-icons/io5";

const NotificationPopup = () => {
  // Dummy notifications (events-related)
  const notifications = [
    {
      id: 1,
      title: "Event Registration Successful",
      description:
        "You have successfully registered for the Startup Networking Summit.",
      time: "7:30 PM",
      unread: true,
    },
    {
      id: 2,
      title: "New Event Added",
      description:
        "A new event 'Tech Fest 2025' has been added to your recommended list.",
      time: "6:45 PM",
      unread: true,
    },
    {
      id: 3,
      title: "Reminder: Workshop Tomorrow",
      description:
        "Don’t forget about the 'Design Thinking Workshop' happening tomorrow.",
      time: "6:00 PM",
      unread: false,
    },
    {
      id: 4,
      title: "Event Feedback Received",
      description:
        "Your feedback for 'AI Bootcamp' has been submitted successfully.",
      time: "5:20 PM",
      unread: false,
    },
  ];

  return (
    <Popover>
      <PopoverTrigger>
        <Button className="h-12! w-12! bg-[#d9d9e0] hover:bg-[#ababb1] rounded-lg p-2 relative">
          <div className="w-5 h-5 rounded-full bg-gradient text-white absolute -top-2 -right-2 flex justify-center items-center text-xs font-semibold">
            {notifications.filter((n) => n.unread).length}
          </div>
          <IoNotificationsOutline className="text-black size-6" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-[450px] max-w-full rounded-xl shadow-lg p-0"
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
        </div>

        {/* Notification List */}
        <div className="max-h-[400px] overflow-y-auto">
          {notifications.map((n) => (
            <div
              key={n.id}
              className="flex justify-between items-start p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <div className="flex-1">
                <p className="font-semibold text-sm text-gray-900">{n.title}</p>
                <p className="text-sm text-gray-600 mt-1">{n.description}</p>
              </div>
              <div className="flex flex-col items-end ml-3">
                <span className="text-xs text-gray-500">{n.time}</span>
                {n.unread && (
                  <span className="w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center mt-1">
                    
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationPopup;
