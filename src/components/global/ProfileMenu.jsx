"use client";
import React, { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "../ui/button";
import { IoIosArrowDropdownCircle } from "react-icons/io";
import Link from "next/link";
import { useRouter } from "next/navigation";

const ProfileMenu = () => {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    console.log("Logout");
    router.push("/auth/login");
    setOpen(false); // close the popover
  };

  const handleItemClick = () => {
    setOpen(false); // close on any item click
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button className="flex items-center gap-2 bg-transparent hover:bg-transparent p-0">
          <div className="h-11 w-11 bg-[url(/images/profile.png)] bg-cover bg-center rounded-full" />
          <p className="text-black font-medium">Store Name</p>
          <IoIosArrowDropdownCircle className="text-primary text-xl" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-48 p-0 rounded-lg shadow-md border border-gray-200"
      >
        <div className="flex flex-col">
          <Link
            href="/dashboard/profile"
            onClick={handleItemClick}
            className="px-4 py-3 text-sm text-gray-800 hover:bg-gray-100 cursor-pointer"
          >
            View Profile
          </Link>

          <Link
            href="/dashboard/settings"
            onClick={handleItemClick}
            className="px-4 py-3 text-sm text-gray-800 hover:bg-gray-100 cursor-pointer"
          >
            Settings
          </Link>

          <div className="border-t border-gray-200" />

          <button
            onClick={handleLogout}
            className="px-4 py-3 text-sm text-red-500 hover:bg-gray-100 text-left cursor-pointer"
          >
            Log Out
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ProfileMenu;
