"use client";
import React, { useState } from "react";
import { Send, Search } from "lucide-react";
import { Button } from "../ui/button";

export default function ChatUI() {
  const [activeTab, setActiveTab] = useState("users");
  const [selectedUser, setSelectedUser] = useState(null);

  const users = [
    {
      id: 1,
      name: "John Doe",
      message: "Pls take a look at the images.",
      time: "2 min ago",
      unread: 5,
      avatar: "JD",
    },
    {
      id: 2,
      name: "Darlene Steward",
      message: "Pls take a look at the images.",
      time: "5 min ago",
      unread: 0,
      avatar: "DS",
    },
    {
      id: 3,
      name: "Robert Martinez",
      message: "Can we schedule a meeting tomorrow?",
      time: "12 min ago",
      unread: 3,
      avatar: "RM",
    },
    {
      id: 4,
      name: "Emily Chen",
      message: "The project looks amazing!",
      time: "25 min ago",
      unread: 0,
      avatar: "EC",
    },
    {
      id: 5,
      name: "Michael Brown",
      message: "I sent you the documents.",
      time: "1 hour ago",
      unread: 1,
      avatar: "MB",
    },
    {
      id: 6,
      name: "Jessica Taylor",
      message: "Thanks for your help yesterday.",
      time: "2 hours ago",
      unread: 0,
      avatar: "JT",
    },
    {
      id: 7,
      name: "David Wilson",
      message: "Are you available for a quick call?",
      time: "3 hours ago",
      unread: 2,
      avatar: "DW",
    },
    {
      id: 8,
      name: "Amanda Garcia",
      message: "Perfect! See you then.",
      time: "Yesterday",
      unread: 0,
      avatar: "AG",
    },
  ];

  const bartenders = [
    {
      id: 9,
      name: "Mike Johnson",
      message: "The event was great!",
      time: "10 min ago",
      unread: 2,
      avatar: "MJ",
    },
    {
      id: 10,
      name: "Sarah Williams",
      message: "Thanks for the update.",
      time: "15 min ago",
      unread: 0,
      avatar: "SW",
    },
    {
      id: 11,
      name: "Carlos Rodriguez",
      message: "Inventory is running low on gin.",
      time: "30 min ago",
      unread: 4,
      avatar: "CR",
    },
    {
      id: 12,
      name: "Lisa Anderson",
      message: "Tonight's shift schedule is ready.",
      time: "45 min ago",
      unread: 0,
      avatar: "LA",
    },
    {
      id: 13,
      name: "Tom Mitchell",
      message: "Can I swap my shift this weekend?",
      time: "1 hour ago",
      unread: 1,
      avatar: "TM",
    },
    {
      id: 14,
      name: "Nina Patel",
      message: "New cocktail recipe is a hit!",
      time: "2 hours ago",
      unread: 0,
      avatar: "NP",
    },
    {
      id: 15,
      name: "James Cooper",
      message: "Need help with the bar setup.",
      time: "4 hours ago",
      unread: 3,
      avatar: "JC",
    },
  ];

  const chats = {
    1: [
      {
        id: 1,
        sender: "John Doe",
        message: "labore et dolore magna aliqua.",
        time: "09:25 AM",
        isOwn: false,
      },
      {
        id: 2,
        sender: "You",
        message:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elitelusmod tempor incididunt ut labore et dolore magna aliqua.",
        time: "09:25 AM",
        isOwn: true,
      },
      {
        id: 3,
        sender: "John Doe",
        message: "labore et dolore magna aliqua.",
        time: "09:25 AM",
        isOwn: false,
      },
      {
        id: 4,
        sender: "John Doe",
        message: "Sed ut perspiciatis",
        time: "09:25 AM",
        isOwn: false,
      },
      {
        id: 5,
        sender: "You",
        message: "Lorem ipsum dolor sit ut labore et dolore magna aliqua.",
        time: "09:25 AM",
        isOwn: true,
      },
    ],
    2: [
      {
        id: 1,
        sender: "Darlene Steward",
        message: "Hey, how are you?",
        time: "08:15 AM",
        isOwn: false,
      },
      {
        id: 2,
        sender: "You",
        message: "I am doing great, thanks!",
        time: "08:16 AM",
        isOwn: true,
      },
      {
        id: 3,
        sender: "Darlene Steward",
        message: "Pls take a look at the images.",
        time: "08:20 AM",
        isOwn: false,
      },
    ],
    3: [
      {
        id: 1,
        sender: "Robert Martinez",
        message: "Good morning!",
        time: "07:45 AM",
        isOwn: false,
      },
      {
        id: 2,
        sender: "You",
        message: "Morning! How can I help you?",
        time: "07:46 AM",
        isOwn: true,
      },
      {
        id: 3,
        sender: "Robert Martinez",
        message: "Can we schedule a meeting tomorrow?",
        time: "07:48 AM",
        isOwn: false,
      },
    ],
    4: [
      {
        id: 1,
        sender: "Emily Chen",
        message: "Just finished reviewing the project.",
        time: "06:30 AM",
        isOwn: false,
      },
      {
        id: 2,
        sender: "You",
        message: "Great! What do you think?",
        time: "06:32 AM",
        isOwn: true,
      },
      {
        id: 3,
        sender: "Emily Chen",
        message: "The project looks amazing!",
        time: "06:35 AM",
        isOwn: false,
      },
    ],
    5: [
      {
        id: 1,
        sender: "Michael Brown",
        message: "I sent you the documents.",
        time: "05:20 AM",
        isOwn: false,
      },
      {
        id: 2,
        sender: "You",
        message: "Thank you! I will review them.",
        time: "05:25 AM",
        isOwn: true,
      },
    ],
    6: [
      {
        id: 1,
        sender: "Jessica Taylor",
        message: "Thanks for your help yesterday.",
        time: "04:10 AM",
        isOwn: false,
      },
      {
        id: 2,
        sender: "You",
        message: "Anytime! Happy to help.",
        time: "04:15 AM",
        isOwn: true,
      },
    ],
    7: [
      {
        id: 1,
        sender: "David Wilson",
        message: "Are you available for a quick call?",
        time: "03:30 AM",
        isOwn: false,
      },
    ],
    8: [
      {
        id: 1,
        sender: "Amanda Garcia",
        message: "Let's meet at 3 PM.",
        time: "Yesterday",
        isOwn: false,
      },
      {
        id: 2,
        sender: "You",
        message: "Perfect! See you then.",
        time: "Yesterday",
        isOwn: true,
      },
    ],
    9: [
      {
        id: 1,
        sender: "Mike Johnson",
        message: "The event was amazing!",
        time: "06:30 AM",
        isOwn: false,
      },
      {
        id: 2,
        sender: "You",
        message: "Glad you enjoyed it!",
        time: "06:35 AM",
        isOwn: true,
      },
      {
        id: 3,
        sender: "Mike Johnson",
        message: "The event was great!",
        time: "06:40 AM",
        isOwn: false,
      },
    ],
    10: [
      {
        id: 1,
        sender: "Sarah Williams",
        message: "Thanks for all your help.",
        time: "05:20 AM",
        isOwn: false,
      },
      {
        id: 2,
        sender: "You",
        message: "No problem at all!",
        time: "05:25 AM",
        isOwn: true,
      },
    ],
    11: [
      {
        id: 1,
        sender: "Carlos Rodriguez",
        message: "Inventory is running low on gin.",
        time: "04:50 AM",
        isOwn: false,
      },
      {
        id: 2,
        sender: "You",
        message: "I will order more supplies today.",
        time: "04:55 AM",
        isOwn: true,
      },
    ],
    12: [
      {
        id: 1,
        sender: "Lisa Anderson",
        message: "Tonight's shift schedule is ready.",
        time: "04:10 AM",
        isOwn: false,
      },
    ],
    13: [
      {
        id: 1,
        sender: "Tom Mitchell",
        message: "Can I swap my shift this weekend?",
        time: "03:45 AM",
        isOwn: false,
      },
      {
        id: 2,
        sender: "You",
        message: "Let me check and get back to you.",
        time: "03:50 AM",
        isOwn: true,
      },
    ],
    14: [
      {
        id: 1,
        sender: "Nina Patel",
        message: "New cocktail recipe is a hit!",
        time: "02:30 AM",
        isOwn: false,
      },
      {
        id: 2,
        sender: "You",
        message: "That's fantastic news!",
        time: "02:35 AM",
        isOwn: true,
      },
    ],
    15: [
      {
        id: 1,
        sender: "James Cooper",
        message: "Need help with the bar setup.",
        time: "01:20 AM",
        isOwn: false,
      },
    ],
  };

  const currentList = activeTab === "users" ? users : bartenders;
  const currentChats = selectedUser ? chats[selectedUser.id] || [] : [];

  return (
    <div className="h-full flex bg-gray-50 rounded-2xl overflow-hidden">
      {/* Left Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-3 h-[81px] border-b border-gray-200 flex items-center justify-center">
          {/* Search Bar */}
          <div className="w-full relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search"
              className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="p-2">
          <div className="flex gap-1 rounded-md bg-gray-200 p-1">
            <Button
              onClick={() => setActiveTab("users")}
              className={`flex-1 py-3 text-sm font-medium ${
                activeTab === "users"
                  ? "bg-primary text-white"
                  : "bg-white text-[#181818] hover:bg-white"
              }`}
            >
              Users
            </Button>
            <Button
              onClick={() => setActiveTab("bartenders")}
              className={`flex-1 py-3 text-sm font-medium ${
                activeTab === "bartenders"
                  ? "bg-primary text-white"
                  : "bg-white text-[#181818] hover:bg-white"
              }`}
            >
              Bartenders
            </Button>
          </div>
        </div>

        {/* User List */}
        <div className="flex-1 overflow-y-auto">
          {currentList.map((user) => (
            <div
              key={user.id}
              onClick={() => setSelectedUser(user)}
              className={`flex items-center gap-3 p-4 hover:bg-gray-50 cursor-pointer border-l-4 ${
                selectedUser?.id === user.id
                  ? "border-indigo-950 bg-gray-50"
                  : "border-transparent"
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center text-white font-semibold flex-shrink-0">
                {user.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-gray-900 text-sm">
                    {user.name}
                  </h3>
                </div>
                <p className="text-sm text-gray-600 truncate">{user.message}</p>
              </div>
              <div className="flex flex-col items-end justify-between gap-1.5">
                <span className="text-xs text-gray-400">{user.time}</span>

                {user.unread > 0 && (
                  <div className="w-6 h-6 rounded-full bg-indigo-950 text-white text-xs flex items-center justify-center font-semibold flex-shrink-0">
                    {user.unread}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center text-white font-semibold">
                {selectedUser.avatar}
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                {selectedUser.name}
              </h2>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Today Label */}
              <div className="flex justify-center">
                <span className="px-3 py-1 bg-gray-200 text-gray-600 text-xs rounded-full">
                  Today
                </span>
              </div>

              {/* Chat Messages */}
              {currentChats.map((chat) => (
                <div
                  key={chat.id}
                  className={`flex ${
                    chat.isOwn ? "justify-end" : "justify-start"
                  }`}
                >
                  {!chat.isOwn && (
                    <div className="w-10 h-10 rounded-full bg-gradient flex items-center justify-center text-white font-semibold mr-3 shrink-0">
                      {selectedUser.avatar}
                    </div>
                  )}
                  <div className="flex flex-col items-end">
                    <div
                      className={`max-w-md rounded-lg ${
                        chat.isOwn
                          ? "bg-gradient text-white rounded-tr-none"
                          : "bg-[#E6E6E6] text-gray-900 rounded-tl-none"
                      } px-4 py-2`}
                    >
                      <p className="text-sm">{chat.message}</p>
                    </div>

                    <span className={`text-xs mt-1 text-black`}>
                      {chat.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Input Area */}
            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Type Here..."
                  className="flex-1 px-4 py-3 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button className="w-12 h-12 bg-primary text-white rounded-lg flex items-center justify-center hover:bg-primary/90 transition-all">
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <p>Select a conversation to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
}
