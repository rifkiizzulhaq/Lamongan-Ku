"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNavbar() {
  const pathname = usePathname();

  if (pathname === "/") {
    return null;
  }

  const navItems = [
    {
      name: "Bungkus",
      href: "/bungkus",
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
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
    },
    {
      name: "Meja",
      href: "/meja",
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
          <rect width="20" height="15" x="2" y="3" rx="2" />
          <path d="M12 18v4" />
          <path d="M8 22h8" />
        </svg>
      ),
    },
    {
      name: "Riwayat",
      href: "/riwayat",
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
          <rect width="20" height="15" x="2" y="3" rx="2" />
          <path d="M12 18v4" />
          <path d="M8 22h8" />
        </svg>
      ),
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full h-16 dark:bg-white bg-white border-t-2 border-neutral-800 dark:border-neutral-200">
      <div className="grid h-full max-w-lg grid-cols-4 mx-auto font-medium">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 group ${
                isActive ? "bg-neutral-800 text-white" : "text-gray-500"
              }`}
            >
              <div
                className={`mb-1 group-hover:text-blue-600 transition-colors ${
                  isActive ? "text-white" : "text-gray-500"
                }`}
              >
                {item.icon}
              </div>
              <span className="text-xs">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
