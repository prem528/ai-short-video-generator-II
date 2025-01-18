"use client";
import {
  CircleUserIcon,
  PanelsTopLeft,
  Plus,
  Wallet2,
  LockKeyhole,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

function SideNav() {
  const MenuOption = [
    {
      id: 1,
      name: "Dashboard",
      path: "/dashboard",
      icons: PanelsTopLeft,
    },
    {
      id: 2,
      name: "Create New",
      path: "/dashboard/create-new",
      icons: Plus,
    },
    {
      id: 3,
      name: "Add Credits",
      path: "/dashboard/add-credits",
      icons: Wallet2,
    },
    {
      id: 4,
      name: "Account",
      path: "/dashboard/account",
      icons: CircleUserIcon,
    },
  ];

  const path = usePathname();

  return (
    <div className="w-64 h-full p-5">
      {/* Menu Items */}
      <div className="grid gap">
        {MenuOption.map((item) => (
          <div key={item.id} className="gap-4 p-2 rounded-lg">
            <Link href={item.path}>
              <div
                className={`flex items-center gap-3 p-3 hover:bg-blue-500 hover:text-white rounded-md cursor-pointer ${
                  path === item.path && "bg-blue-500 text-white"
                }`}
              >
                <item.icons />
                <h2>{item.name}</h2>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SideNav;
