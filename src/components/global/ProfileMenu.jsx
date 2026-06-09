"use client";
import React, { useState } from "react";
import Cookies from "js-cookie";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "../ui/button";
import { IoIosArrowDropdownCircle } from "react-icons/io";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLogout } from "@/lib/hooks/mutations/AuthMutations";
import { ErrorToast } from "../ui/toaster";
import LogoutConfirmationModal from "../common/LogoutConfirmationModal";
import { useQueryClient } from "@tanstack/react-query";

const ProfileMenu = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const logoutMutation = useLogout();

  const handleLogoutClick = () => {
    setOpen(false); // close popover
    setIsLogoutModalOpen(true); // open confirmation modal
  };

  const handleConfirmLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      queryClient.setQueryData(["auth-me"], null);
      // Explicitly clear cookies
      Cookies.remove("authorization");
      Cookies.remove("tokenType");

      setIsLogoutModalOpen(false);
      router.push("/auth/login");
    } catch (error) {
      console.error("Logout error:", error);
      if (error.code === "NO_INTERNET") {
        ErrorToast(error.message);
      } else {
        ErrorToast(
          error.response?.data?.message ||
            "An error occurred during logout. Please try again.",
        );
      }
      setIsLogoutModalOpen(false);
    }
  };

  const handleItemClick = () => {
    setOpen(false); // close on any item click
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen} className="w-20! max-w-20!">
        <PopoverTrigger asChild>
          <Button className="flex items-center gap-2 bg-transparent hover:bg-transparent p-0">
            <div className="h-11 w-11 bg-[url(/images/profile.png)] bg-cover bg-center rounded-full" />
            <p className="text-black font-medium">Store Name</p>
            <IoIosArrowDropdownCircle className="text-primary text-xl" />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          align="end"
          className="w-40! max-w-40! min-w-40! p-0 rounded-lg shadow-md border border-gray-200"
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
              onClick={handleLogoutClick}
              className="px-4 py-3 text-sm text-red-500 hover:bg-gray-100 text-left cursor-pointer"
            >
              Log Out
            </button>
          </div>
        </PopoverContent>
      </Popover>

      <LogoutConfirmationModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleConfirmLogout}
        isLoading={logoutMutation.isPending}
      />
    </>
  );
};

export default ProfileMenu;
