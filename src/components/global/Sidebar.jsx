"use client";
import { navLinks } from "@/lib/constants";
import Link from "next/link";
import React, { useState } from "react";
import Logo from "../icons/Logo";
import { usePathname, useRouter } from "next/navigation";
import Logout from "../icons/sidebar/Logout";
import { useLogout } from "@/lib/hooks/mutations/AuthMutations";
import { ErrorToast } from "../ui/toaster";
import LogoutConfirmationModal from "../common/LogoutConfirmationModal";
import Cookies from "js-cookie";
import { useQueryClient } from "@tanstack/react-query";

const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const logoutMutation = useLogout();
  const queryClient = useQueryClient();

  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const handleLogoutClick = () => {
    setIsLogoutModalOpen(true);
  };

  const handleConfirmLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      queryClient.invalidateQueries({ queryKey: ["auth-me"] });
      queryClient.clear();

      setIsLogoutModalOpen(false);
      router.push("/auth/login");
    } catch (error) {
      console.log(error, "error===<12");
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

  return (
    <>
      <nav className="joyride-sidebar h-full flex flex-col bg-[url(/images/bg-image.png)] bg-cover bg-center min-w-[227px] w-fit rounded-3xl p-5 overflow-y-auto hidden-scrollbar">
        <Logo />
        <ul className="h-full flex-1 flex flex-col justify-between mt-7 space-y-2">
          <div className="space-y-3">
            {navLinks.map((link, index) => {
              const isActive = pathname === link.path; // active link check
              const joyrideClass = `joyride-nav-${link.name
                .toLowerCase()
                .replace(/[^a-z0-9]/g, "-")}`;
              return (
                <li key={index}>
                  <Link
                    href={link.path}
                    className={`flex items-center text-[13px] font-medium gap-2 py-2.5 px-5 rounded-lg ${joyrideClass} ${
                      isActive ? "text-primary bg-white" : "text-white"
                    }`}
                  >
                    {isActive ? link.selectedIcon : link.icon}
                    <span>{link.name}</span>
                  </Link>
                </li>
              );
            })}
          </div>
          <li className="mt-10">
            <button
              onClick={handleLogoutClick}
              className={`w-fit mb-5 flex items-center gap-2 py-2 px-5 rounded-xl text-primary bg-white cursor-pointer hover:bg-gray-100 transition-colors`}
            >
              <Logout />
              <span>Log out</span>
            </button>
          </li>
        </ul>
      </nav>

      <LogoutConfirmationModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleConfirmLogout}
        isLoading={logoutMutation.isPending}
      />
    </>
  );
};

export default Sidebar;
