"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LuLayoutDashboard,
  LuTrendingUp,
  LuPackage,
  LuSettings,
} from "react-icons/lu";

export default function BosBottomNavbar() {
  const pathname = usePathname();

  const navItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: <LuLayoutDashboard size={24} strokeWidth={2} />,
    },
    {
      name: "Laporan",
      href: "/laporan",
      icon: <LuTrendingUp size={24} strokeWidth={2} />,
    },
    {
      name: "Stock",
      href: "/stock",
      icon: <LuPackage size={24} strokeWidth={2} />,
    },
    {
      name: "Toko",
      href: "/pengaturan",
      icon: <LuSettings size={24} strokeWidth={2} />,
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full h-16 dark:bg-white bg-white border-t-2 border-neutral-800 dark:border-neutral-200">
      <div className="grid h-full max-w-lg grid-cols-4 mx-auto font-medium">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`inline-flex flex-col items-center justify-center hover:bg-gray-50 group transition-all duration-200 ${
                isActive ? "bg-neutral-800 text-white" : "text-gray-500"
              }`}
            >
              <div
                className={`mb-1 group-hover:text-neutral-800 transition-colors ${
                  isActive ? "text-white" : "text-gray-500"
                }`}
              >
                {item.icon}
              </div>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider ${
                  isActive
                    ? "text-white"
                    : "text-gray-500 group-hover:text-neutral-800"
                }`}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
