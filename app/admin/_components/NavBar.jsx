"use client";

import { UserDetailContext } from "@/app/_context/userDataContext";
import { ThemeToggle } from "@/app/about/_components/toggle-theme";
import { Button } from "@/components/ui/button";
import { UserButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import React, { useContext, useState } from "react";

function NavBar() {
  const { userData } = useContext(UserDetailContext);
  const [menuOpen, setMenuOpen] = useState(false); // Menu toggle state

  return (
    <div className="p-3 px-5 flex items-center justify-between shadow-lg border-gray-200 backdrop-blur-sm bg-opacity-90 bg-white relative">
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

        {/* Hamburger Menu for Small Screens */}
        <button
          className="md:hidden flex items-center p-2 text-gray-700 hover:text-gray-900 focus:outline-none"
          onClick={() => setMenuOpen(!menuOpen)}
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
              d="M4 6h16M4 12h16m-7 6h7"
            ></path>
          </svg>
        </button>

        {/* Menu Items for Small Screens */}
        {menuOpen && (
          <div
          className={`absolute top-16 right-5 w-56  bg-white shadow-lg rounded-lg z-50 transform transition-transform duration-300 ${
            menuOpen ? "scale-100 opacity-100" : "scale-0 opacity-0"
          }`}
          >
            <div className="flex flex-col items-start p-4 space-y-4">
              {/* Dashboard Button */}
              <Link href="/dashboard" className="w-full">
                <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white text-sm">
                  Dashboard
                </Button>
              </Link>

              {/* User Button */}
              <div className="w-full">
                <UserButton />
              </div>
            </div>
          </div>
        )}

        {/* Standard Layout for Medium and Larger Screens */}
        <div className="hidden md:flex gap-3 items-center">
          <Link href="/dashboard">
            <Button className="bg-blue-500 hover:bg-blue-600 text-white">
              Dashboard
            </Button>
          </Link>
          <UserButton />
        </div>
      </div>
    </div>
  );
}

export default NavBar;
