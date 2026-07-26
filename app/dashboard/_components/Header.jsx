"use client";

import { UserDetailContext } from "@/app/_context/userDataContext";
import { ThemeToggle } from "@/app/about/_components/toggle-theme";
import { Button } from "@/components/ui/button";
import { UserButton, useUser } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import React, { useContext, useState } from "react";

function Header({ onMenuClick, sideNavOpen }) {
  const { user, isLoaded } = useUser();
  const { userData } = useContext(UserDetailContext);

  if (!isLoaded) {
    return null;
  }

  const isAdmin = user?.publicMetadata?.role === "admin";

  return (
    <div className="flex h-[60px] items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-md md:px-6">
      {/* Logo Section — filmstrip play mark + wordmark */}
      <Link href="/" className="flex w-64 items-center gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand to-brand-2 shadow-sm">
          <svg width="13" height="13" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M2.5 1.5L10 6L2.5 10.5V1.5Z" fill="white" />
          </svg>
        </span>
        <div className="leading-tight">
          <span className="block text-[15px] font-semibold tracking-tight text-foreground">
            Shorts Studio
          </span>
          <span className="timecode block text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
            AI Video Engine
          </span>
        </div>
      </Link>

      {/* Right Section */}
      <div className="flex items-center gap-2.5">
        {/* Theme Toggle - Always Visible */}
        <ThemeToggle />
        <div className="flex items-center gap-1.5 rounded-md border border-border bg-secondary px-2.5 py-1.5">
          <Image src={"/coin.png"} alt="" height={16} width={16} />
          <span className="timecode text-sm font-medium tabular-nums text-foreground">
            {userData?.credits ?? "—"}
          </span>
          <span className="timecode hidden text-[9px] uppercase tracking-wider text-muted-foreground sm:inline">
            cr
          </span>
        </div>

        {isAdmin && (
          <Link href="/admin">
            <Button className="bg-brand text-brand-foreground hover:bg-brand/90 text-sm md:text-base">
              Admin
            </Button>
          </Link>
        )}

        {/* Menu Toggle for Small Screens */}
        <button
          className="md:hidden flex items-center p-2 text-foreground hover:text-foreground/80 focus:outline-none"
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
              d={
                sideNavOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"
              }
            />
          </svg>
        </button>
        <div className="hidden md:flex ">
          <UserButton />
        </div>
      </div>
    </div>
  );
}

export default Header;