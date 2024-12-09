"use client";

import { Circle, FileVideo, PanelsTopLeft, ShieldPlus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

function SideNav() {
  const MenuOption = [
    {
      id: 1,
      name: "Dashboard",
      path: "/dashboard",
      icon: PanelsTopLeft,
    },
    {
      id: 2,
      name: "Create New",
      path: "/dashboard/create-new",
      icon: FileVideo,
    },
    {
      id: 3,
      name: "Upgrade",
      path: "/upgrade",
      icon: ShieldPlus,
    },
    {
      id: 4,
      name: "Account",
      path: "/account",
      icon: Circle,
    },
  ];

  const path = usePathname();

  return (
    <div className="w-64 h-screen shadow-lg border-r border-gray-200 bg-white p-5">
      <div className="space-y-2">
        {MenuOption.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-4 p-3 rounded-lg hover:shadow-md hover:bg-primary hover:text-white cursor-pointer transition-all"
          >
            <Link href={item.path} className="flex items-center gap-4">
              <item.icon
                className={`w-5 h-5 text-gray-600 group-hover:text-white ${
                  path == item.path && "bg-primary text-white"
                }`}
              />
              <h2 className="text-gray-800 group-hover:text-white">
                {item.name}
              </h2>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SideNav;
