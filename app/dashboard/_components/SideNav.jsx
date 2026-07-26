"use client";
import { PanelsTopLeft, Plus, Wallet2, CircleUserIcon, Film } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

function SideNav({ activeOverride } = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const path = activeOverride ?? pathname;

  const MenuOption = [
    { id: 1, name: "Dashboard", path: "/dashboard", icons: PanelsTopLeft },
    { id: 2, name: "Create New", path: "/dashboard/create-new", icons: Plus },
    { id: 5, name: "Assemble Video", path: "/dashboard/assemble", icons: Film },
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
    <div className="flex h-full flex-col bg-panel">
      {/* Track list label */}
      <div className="px-5 pt-6 pb-3">
        <span className="timecode text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          Workspace
        </span>
      </div>

      {/* Navigation — active item marked by an edge playhead rail */}
      <nav className="flex flex-col gap-1 px-3">
        {MenuOption.map((item) => {
          const active = path === item.path;
          return (
            <Link
              key={item.id}
              href={item.path}
              className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors duration-200
                ${
                  active
                    ? "bg-brand/10 text-foreground"
                    : "text-muted-foreground hover:bg-foreground/[0.05] hover:text-foreground"
                }`}
            >
              {/* Playhead — flush to the sidebar's left edge, spanning the full row height */}
              {active && (
                <span className="playhead absolute -left-3 top-1 bottom-1 w-1 rounded-r-full bg-brand" />
              )}

              <item.icons
                className={`h-[18px] w-[18px] shrink-0 transition-colors ${
                  active ? "text-brand" : "text-muted-foreground group-hover:text-foreground"
                }`}
              />
              <span className="text-sm font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto px-5 pb-6">
        <div className="h-px w-full bg-border" />
        <div className="mt-4 flex items-center gap-2">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-2/70" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand-2" />
          </span>
          <span className="timecode text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            Studio · Online
          </span>
        </div>
      </div>
    </div>
  );
}

export default SideNav;
