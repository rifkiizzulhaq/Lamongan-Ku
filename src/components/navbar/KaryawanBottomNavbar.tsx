"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useGlobalNotifications } from "@/src/hooks/useGlobalNotifications";
import { useNotificationStore } from "@/src/store/notificationStore";

export default function KaryawanBottomNavbar() {
  const pathname = usePathname();
  useGlobalNotifications();

  const { hasNewBungkus, hasNewMeja, setHasNewBungkus, setHasNewMeja } =
    useNotificationStore();

  useEffect(() => {
    if (pathname === "/bungkus") {
      setHasNewBungkus(false);
    }
    if (pathname.startsWith("/meja")) {
      setHasNewMeja(false);
    }
  }, [pathname, setHasNewBungkus, setHasNewMeja]);

  if (pathname === "/") {
    return null;
  }

  const navItems = [
    {
      name: "Antrean",
      href: "/antrean",
      hasNotification: hasNewBungkus || hasNewMeja,
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" x2="8" y1="13" y2="13" />
          <line x1="16" x2="8" y1="17" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      ),
    },
    {
      name: "Bungkus",
      href: "/bungkus",
      hasNotification: hasNewBungkus,
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
          <path d="M3 6h18" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
      ),
    },
    {
      name: "Meja",
      href: "/meja",
      hasNotification: hasNewMeja,
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect width="7" height="7" x="3" y="3" rx="1" />
          <rect width="7" height="7" x="14" y="3" rx="1" />
          <rect width="7" height="7" x="14" y="14" rx="1" />
          <rect width="7" height="7" x="3" y="14" rx="1" />
        </svg>
      ),
    },
    {
      name: "Riwayat",
      href: "/riwayat",
      hasNotification: false,
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
          <path d="M3 3v5h5" />
          <path d="M12 7v5l4 2" />
        </svg>
      ),
    },
    {
      name: "Lainnya",
      href: "/more",
      hasNotification: false,
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="4" x2="20" y1="12" y2="12" />
          <line x1="4" x2="20" y1="6" y2="6" />
          <line x1="4" x2="20" y1="18" y2="18" />
        </svg>
      ),
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full h-16 dark:bg-white bg-white border-t-2 border-neutral-800 dark:border-neutral-200">
      <div className="grid h-full max-w-lg grid-cols-5 mx-auto font-medium">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 group relative ${
                isActive ? "bg-neutral-800 text-white" : "text-gray-500"
              }`}
            >
              <div
                className={`mb-1 relative group-hover:text-blue-600 transition-colors ${
                  isActive ? "text-white" : "text-gray-500"
                }`}
              >
                {item.icon}
                {item.hasNotification && (
                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border-2 border-white dark:border-neutral-800"></span>
                  </span>
                )}
              </div>
              <span className="text-xs">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
