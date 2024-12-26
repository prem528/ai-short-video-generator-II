"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";

export default function Header() {
  const { user } = useUser();

  const userRole = user?.publicMetadata?.role; // Assuming role is stored in publicMetadata
  const redirectPath = userRole === "admin" ? "/admin" : "/dashboard";

  return (
    <header className="fixed top-0 left-0 right-0 z-50  backdrop-blur-sm bg-opacity-10  ">
      <nav className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <Link
            href="/"
            className="flex items-center text-2xl font-bold text-white gap-2"
          >
            <Image src={"/logo.png"} width={100} height={50} alt="logo" />
            <h2 className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-pink-500">
              Video Generator
            </h2>
          </Link>
          <div className="font-bold hidden md:flex space-x-6">
            <Link
              href="#features"
              className=" text-blue-600 hover:text-black transition-colors"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="text-blue-600 hover:text-black transition-colors"
            >
              How It Works
            </Link>
            <Link
              href="#pricing"
              className="text-blue-600 hover:text-black transition-colors"
            >
              Pricing
            </Link>
          </div>
          <div className="flex gap-3 items-center">
            <Link
              href={redirectPath}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full transition-colors"
            >
              Get Started
            </Link>
            <UserButton />
          </div>
        </div>
      </nav>
    </header>
  );
}
