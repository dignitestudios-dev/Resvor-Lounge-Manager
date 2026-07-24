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
import { useAuthMe } from "@/lib/hooks/queries/useQueries";
import { useAuthContext } from "@/lib/context/AuthProvider";

const ProfileMenu = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const logoutMutation = useLogout();
  const { data: authMeData } = useAuthMe();
  const authContext = useAuthContext();
  const user = authMeData?.user || authMeData || authContext?.user || {};

  const firstName = user?.firstName || "";
  const lastName = user?.lastName || "";

  const displayName =
    firstName || lastName
      ? `${firstName} ${lastName}`.trim()
      : user?.fullName || user?.name || "Lounge Manager";

  const getInitials = (fName, lName, fallbackName) => {
    if (fName || lName) {
      const f = fName ? fName.charAt(0).toUpperCase() : "";
      const l = lName ? lName.charAt(0).toUpperCase() : "";
      return `${f}${l}` || "LM";
    }
    if (fallbackName) {
      const parts = fallbackName.trim().split(" ").filter(Boolean);
      if (parts.length >= 2) {
        return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
      } else if (parts.length === 1) {
        return parts[0].substring(0, 2).toUpperCase();
      }
    }
    return "LM";
  };

  const initials = getInitials(firstName, lastName, user?.fullName || user?.name);

  const handleLogoutClick = () => {
    setOpen(false); // close popover
    setIsLogoutModalOpen(true); // open confirmation modal
  };

  const handleConfirmLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      queryClient.invalidateQueries({ queryKey: ["auth-me"] });
      queryClient.clear();

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
            <div className="h-11 w-11 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-sm border border-primary/20 shadow-xs uppercase select-none">
              {initials}
            </div>
            <p className="text-black font-medium">{displayName}</p>
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

            <button
              onClick={() => {
                handleItemClick();
                localStorage.setItem("show_welcome_walkthrough", "true");
                window.location.reload();
              }}
              className="px-4 py-3 text-sm text-primary font-medium hover:bg-gray-100 text-left cursor-pointer"
            >
              Take Walkthrough
            </button>

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
