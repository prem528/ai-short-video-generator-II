import { UserDetailContext } from "@/app/_context/userDataContext";
import { ThemeToggle } from "@/app/about/_components/toggle-theme";
import { Button } from "@/components/ui/button";
import { UserButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import React, { useContext } from "react";

function NavBar() {
  const { userData, setUserData } = useContext(UserDetailContext);

  return (
    <div className="p-3 px-5 flex items-center justify-between shadow-lg border-gray-200 backdrop-blur-sm bg-opacity-90 ">
      <Link href="/" className="flex gap-3 items-center">
        <Image src={"/logo.png"} width={100} height={50} alt="logo" />
        <h2 className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-red-500 font-bold text-xl">Video Generator</h2>
      </Link>
      <ThemeToggle/>
      <div className="flex gap-3 items-center">
        <Link href="/dashboard">
          <Button>Dashboard</Button>
        </Link>
        <UserButton />
      </div>
    </div>
  );
}

export default NavBar;
