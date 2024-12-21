import { UserDetailContext } from "@/app/_context/userDataContext";
import { Button } from "@/components/ui/button";
import { UserButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import React, { useContext } from "react";

function Header() {
  const { userData, setUserData } = useContext(UserDetailContext);

  return (
    <div className="p-3 px-5 flex items-center justify-between shadow-lg border-b border-gray-200 bg-white">
      <Link href="/" className="flex gap-3 items-center">
        <Image src={"/logo.png"} width={100} height={50} alt="logo" />
        <h2 className="font-bold text-xl">Video Generator</h2>
      </Link>
      <div className="flex gap-3 items-center">
        <div className="flex gap-1 items-center">
          <Image src={"/coin.png"} alt="coin" height={20} width={20} />
          <h2>{userData?.credits}</h2>
        </div>
        <Button>Dashboard</Button>
        <UserButton />
      </div>
    </div>
  );
}

export default Header;
