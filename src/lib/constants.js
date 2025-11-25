import Bartenders from "@/components/icons/sidebar/bartenders";
import BartendersRequests from "@/components/icons/sidebar/bartenders-requests";
import Bookings from "@/components/icons/sidebar/bookings";
import CampaignAndFlyers from "@/components/icons/sidebar/campaign-and-flyers";
import Chat from "@/components/icons/sidebar/chat";
import Dashboard from "@/components/icons/sidebar/dashboard";
import EventManagement from "@/components/icons/sidebar/event-management";
import Guestbook from "@/components/icons/sidebar/guestbook";
import Payments from "@/components/icons/sidebar/payments";
import ScanQrCode from "@/components/icons/sidebar/scan-qr-code";
import Service from "@/components/icons/sidebar/service";
import Shift from "@/components/icons/sidebar/shift";

export const navLinks = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: <Dashboard />,
    selectedIcon: <Dashboard color="#010053" />,
  },
  {
    name: "Guestbook",
    path: "/dashboard/guestbook",
    icon: <Guestbook />,
    selectedIcon: <Guestbook color="#010053" />,
  },
  {
    name: "Bartenders",
    path: "/dashboard/bartenders",
    icon: <Bartenders />,
    selectedIcon: <Bartenders color="#010053" />,
  },
  {
    name: "Shifts & Scheduling",
    path: "/dashboard/shifts-and-scheduling",
    icon: <Shift />,
    selectedIcon: <Shift color="#010053" />,
  },
  {
    name: "Bartenders Requests",
    path: "/dashboard/bartenders-requests",
    icon: <BartendersRequests />,
    selectedIcon: <BartendersRequests color="#010053" />,
  },
  {
    name: "Services",
    path: "/dashboard/services",
    icon: <Service />,
    selectedIcon: <Service color="#010053" />,
  },
  {
    name: "Event Management",
    path: "/dashboard/event-management",
    icon: <EventManagement />,
    selectedIcon: <EventManagement color="#010053" />,
  },
  {
    name: "Bookings",
    path: "/dashboard/bookings",
    icon: <Bookings />,
    selectedIcon: <Bookings color="#010053" />,
  },
  {
    name: "Payments",
    path: "/dashboard/payments",
    icon: <Payments />,
    selectedIcon: <Payments color="#010053" />,
  },
  {
    name: "Campaign and Flyers",
    path: "/dashboard/campaign-and-flyers",
    icon: <CampaignAndFlyers />,
    selectedIcon: <CampaignAndFlyers color="#010053" />,
  },
  {
    name: "Chat",
    path: "/dashboard/chats",
    icon: <Chat />,
    selectedIcon: <Chat color="#010053" />,
  },
  {
    name: "Scan Qr Code",
    path: "/dashboard/scan-qr-code",
    icon: <ScanQrCode />,
    selectedIcon: <ScanQrCode color="#010053" />,
  },
];

// Mock Data
export const dashboardStats = [
  {
    title: "Total Bartenders",
    value: 1190,
    icon: <Guestbook size={34} />,
  },
  {
    title: "Upcoming Events",
    value: 158,
    icon: <EventManagement size={28} />,
  },
  {
    title: "Recent Bookings",
    value: 2260,
    icon: <Bookings size={28} />,
  },
  {
    title: "Completed Bookings",
    value: 30689,
    icon: <Bookings size={28} />,
  },
];

export const months = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
];

export const locations = [
  {
    _id: 1,
    name: "First Lounge",
    address: "123 Bay Street, Downtown Toronto M5J",
    hours: "9 AM - 6 PM, Monday To Saturday",
  },
  {
    _id: 2,
    name: "Second Lounge",
    address: "123 Bay Street, Downtown Toronto M5J",
    hours: "9 AM - 6 PM, Monday To Saturday",
  },
];
