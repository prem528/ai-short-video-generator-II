"use client";

import { UserDetailContext } from "@/app/_context/userDataContext";
import { ThemeToggle } from "@/app/about/_components/toggle-theme";
import { Button } from "@/components/ui/button";
import { UserButton, useUser } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import React, { useContext, useState } from "react";

function Header({ onMenuClick, sideNavOpen }) {
  const { user, isLoaded } = useUser(); // Get the current user and loading state
  const { userData } = useContext(UserDetailContext);
  const [menuOpen, setMenuOpen] = useState(false); // Menu toggle state

  if (!isLoaded) {
    return null;
  }

  // Get the user's role from metadata
  const isAdmin = user?.publicMetadata?.role === "admin";

  return (
    <div className="p-3 px-5 flex items-center justify-between shadow-lg border-gray-200 backdrop-blur-sm bg-opacity-90 bg-white">
      {/* Logo Section */}
      <Link href="/" className="flex gap-3 items-center">
        <Image src={"/logo.png"} width={100} height={50} alt="logo" />
        <h2 className="hidden md:block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-red-500 font-bold text-lg md:text-xl">
          Video Generator
        </h2>
      </Link>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        {/* Theme Toggle - Always Visible */}
        <ThemeToggle />
        <div className="flex gap-1 items-center px-2 py-1 rounded-md bg-yellow-400 text-sm md:text-base">
            <Image src={"/coin.png"} alt="coin" height={20} width={20} />
            <h2>{userData?.credits}</h2>
          </div>

                  {/* Menu Toggle for Small Screens */}
        <button
          className="md:hidden flex items-center p-2 text-gray-700 hover:text-gray-900 focus:outline-none"
          onClick={onMenuClick}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d={sideNavOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"}
            />
          </svg>
        </button>

        {/* Standard Layout for Medium and Larger Screens */}
        <div className="hidden md:flex gap-3 items-center">
          {isAdmin && (
            <Link href="/admin">
              <Button className="bg-blue-500 hover:bg-blue-600 text-white text-sm md:text-base">
                Admin
              </Button>
            </Link>
          )}
          <UserButton/>
        </div>
      </div>
    </div>
  );
}

export default Header;
