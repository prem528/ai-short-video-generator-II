"use client";

import { UserDetailContext } from "@/app/_context/userDataContext";
import { ThemeToggle } from "@/app/about/_components/toggle-theme";
import { Button } from "@/components/ui/button";
import { UserButton, useUser } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import React, { useContext } from "react";

function Header() {
  const { user, isLoaded } = useUser(); // Get the current user and loading state
  const { userData, setUserData } = useContext(UserDetailContext);

  if (!isLoaded) {
    return null;
  }

  // Get the user's role from metadata
  const isAdmin = user?.publicMetadata?.role === "admin";

  return (
    <div className="p-3 px-5 flex items-center justify-between shadow-lg border-gray-200 backdrop-blur-sm bg-opacity-90 ">
      <Link href="/" className="flex gap-3 items-center">
        <Image src={"/logo.png"} width={100} height={50} alt="logo" />
        <h2 className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-red-500 font-bold text-xl">Video Generator</h2>
        
      </Link>
      <div className="flex gap-3 items-center">
        <div className="flex gap-1 items-center px-1 py-1  rounded-md bg-yellow-400 ">
          <Image src={"/coin.png"} alt="coin" height={20} width={20} />
          <h2>{userData?.credits}</h2>
        </div>
        <ThemeToggle/>
        <Link href="/dashboard">
          <Button className="bg-blue-500 hover:bg-blue-600 text-white">Dashboard</Button>
        </Link>
        {isAdmin && (
          <Link href="/admin">
            <Button className="bg-blue-500 hover:bg-blue-600 text-white">
              Admin 
            </Button>
          </Link>
        )}
        <UserButton />
      </div>
    </div>
  );
}

export default Header;
