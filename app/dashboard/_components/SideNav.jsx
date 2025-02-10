"use client";
import { PanelsTopLeft, Plus, Wallet2, CircleUserIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

function SideNav() {
  const router = useRouter();
  const path = usePathname();

  const MenuOption = [
    { id: 1, name: "Dashboard", path: "/dashboard", icons: PanelsTopLeft },
    { id: 2, name: "Create New", path: "/dashboard/create-new", icons: Plus },
    { id: 3, name: "Add Credits", path: "/dashboard/add-credits", icons: Wallet2 },
    { id: 4, name: "Account", path: "/dashboard/account", icons: CircleUserIcon },
  ];

  // Prefetch all menu options on mount
  useEffect(() => {
    MenuOption.forEach((item) => {
      router.prefetch(item.path);
    });
  }, []);

  return (
    <div className="w-64 h-full p-5 bg-background dark:bg-black">
      <div className="grid gap">
        {MenuOption.map((item) => (
          <div key={item.id} className="gap-4 p-2 rounded-lg">
            <Link href={item.path}>
              <div
                className={`flex items-center gap-3 p-3 hover:bg-blue-500 hover:text-white rounded-md cursor-pointer transition-colors
                  ${path === item.path 
                    ? "bg-blue-500 text-white" 
                    : "text-foreground hover:text-white"
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
