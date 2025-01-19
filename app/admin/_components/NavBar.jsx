"use client";

import { UserDetailContext } from "@/app/_context/userDataContext";
import { ThemeToggle } from "@/app/about/_components/toggle-theme";
import { Button } from "@/components/ui/button";
import { UserButton } from "@clerk/nextjs";
import { CircleUserIcon, PanelsTopLeft, ShoppingCart, User, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useContext, useState } from "react";

function NavBar() {
  const { userData } = useContext(UserDetailContext);
  const [menuOpen, setMenuOpen] = useState(false);

  const MenuOptions = [
    {
      id: 1,
      name: "Admin Dashboard",
      path: "/admin",
      icons: PanelsTopLeft,
    },
    {
      id: 2,
      name: "Users",
      path: "/admin/user-list",
      icons: User,
    },
    {
      id: 3,
      name: "Orders",
      path: "/admin/order-list",
      icons: ShoppingCart,
    },
    {
      id: 4,
      name: "Account",
      path: "/admin/account",
      icons: CircleUserIcon,
    },
  ];

  return (
    <>
      <div className="p-3 px-5 py-5 flex items-center justify-between shadow-lg border-gray-200 backdrop-blur-sm bg-background/90 dark:border-gray-800">
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
            className="md:hidden flex items-center p-2 text-foreground hover:text-foreground/80 focus:outline-none"
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

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-0 bg-black/50 transition-opacity md:hidden ${
          menuOpen ? "opacity-100 z-40" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMenuOpen(false)}
      />

      <div
        className={`fixed top-0 right-0 w-64 h-full bg-background dark:bg-background border-l border-border shadow-lg transform transition-transform md:hidden z-50 ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Close Button */}
        <button
          className="absolute top-4 right-4 text-foreground/60 hover:text-foreground"
          onClick={() => setMenuOpen(false)}
        >
          <X className="w-6 h-6" />
        </button>

        {/* Mobile Menu Content */}
        <div className="pt-16 px-4">
          <div className="flex flex-col gap-4">
            {/* User Button for Mobile */}
            <div className="flex justify-center mb-4">
              <UserButton />
            </div>

            {/* Dashboard Button */}
            <Link href="/dashboard" onClick={() => setMenuOpen(false)}>
              <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white">
                Dashboard
              </Button>
            </Link>

            {/* Menu Options */}
            {MenuOptions.map((item) => (
              <Link 
                key={item.id} 
                href={item.path}
                onClick={() => setMenuOpen(false)}
              >
                <div className="flex items-center gap-3 p-3 hover:bg-accent hover:text-accent-foreground rounded-md cursor-pointer text-foreground">
                  <item.icons className="w-5 h-5" />
                  <span>{item.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default NavBar;