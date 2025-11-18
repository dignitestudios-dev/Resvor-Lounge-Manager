"use client";
import { navLinks } from "@/lib/constants";
import Link from "next/link";
import React from "react";
import Logo from "../icons/Logo";
import { usePathname } from "next/navigation";
import Logout from "../icons/sidebar/Logout";

const Sidebar = () => {
  const pathname = usePathname();

  return (
    <nav className="h-full flex flex-col bg-[url(/images/bg-image.png)] bg-cover bg-center min-w-[227px] w-fit rounded-3xl p-5 overflow-y-auto hidden-scrollbar">
      <Logo />
      <ul className="h-full flex-1 flex flex-col justify-between mt-7 space-y-2">
        <div className="space-y-2">
          {navLinks.map((link, index) => {
            const isActive = pathname === link.path; // active link check
            return (
              <li key={index}>
                <Link
                  href={link.path}
                  className={`flex items-center gap-2 py-2 px-5 rounded-xl ${
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
          <Link
            href={"/auth/login"}
            className={`w-fit flex items-center gap-2 py-2 px-5 rounded-xl text-primary bg-white`}
          >
            <Logout />
            <span>Logout</span>
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Sidebar;
