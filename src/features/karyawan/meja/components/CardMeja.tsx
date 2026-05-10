"use client";

import Link from "next/link";

interface CardMejaProps {
  id: number;
  name: string;
  totalItems: number;
  isActive: boolean;
}

export default function CardMeja({ id, name, totalItems, isActive }: CardMejaProps) {
  return (
    <>
      <div
        className={`w-[calc(50%-0.5rem)] h-28 flex bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden shadow-sm transition-colors cursor-pointer group ${isActive ? "hover:border-orange-400 dark:hover:border-orange-500/50" : "hover:border-hijau dark:hover:border-hijau/50"}`}
      >
        <div
          className={`w-2 h-full shrink-0 ${isActive ? "bg-orange" : "bg-hijau"}`}
        ></div>
        <div className="flex-1 flex flex-col justify-between w-full h-full">
          <Link
            href={`/meja/${id}`}
            className="flex flex-col py-3 px-3 w-full h-full"
          >
            <h2 className="text-neutral-800 dark:text-white text-xl font-black uppercase tracking-wider truncate">
              {name}
            </h2>
            <div className="flex flex-col gap-0.5 mt-auto">
              <div className="flex items-center gap-1.5">
                <span className="relative flex w-2 h-2">
                  {isActive && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange opacity-75"></span>
                  )}
                  <span
                    className={`relative inline-flex rounded-full w-2 h-2 ${isActive ? "bg-orange" : "bg-hijau"}`}
                  ></span>
                </span>
                <p
                  className={`text-[11px] font-bold uppercase tracking-widest ${isActive ? "text-orange" : "text-hijau"}`}
                >
                  {isActive ? "Ada Orang" : "Kosong"}
                </p>
              </div>
              <h3 className="text-neutral-600 dark:text-neutral-300 font-extrabold text-base">
                {totalItems} items
              </h3>
            </div>
          </Link>
        </div>
      </div>
    </>
  );
}
