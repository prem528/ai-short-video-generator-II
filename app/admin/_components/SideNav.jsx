"use client";
import {
  CircleUserIcon,
  PanelsTopLeft,
  ShoppingCart,
  User,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

function SideNav() {
  const MenuOption = [
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

  const path = usePathname();

  return (
    <div className="w-64 h-screen shadow-lg border-r border-gray-200 bg-white p-5">
      <div className="grid gap">
        {MenuOption.map((item, index) => (
          <div key={item.id} className="gap-4 p-2 rounded-lg">
            <Link href={item.path}>
              <div
                className={`flex items-center gap-3 p-3 hover:bg-blue-500 hover:text-white rounded-md cursor-pointer
                    ${path == item.path && "bg-blue-500 text-white"}
                    `}
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
