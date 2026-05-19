import React from "react";

export default function LaporanSkeleton() {
  return (
    <div className="flex flex-col gap-4 animate-pulse">
      <div className="w-full h-16 bg-neutral-200 dark:bg-neutral-700 rounded-xl"></div>
      <div className="w-full h-24 bg-neutral-200 dark:bg-neutral-700 rounded-xl"></div>
      <div className="w-full h-24 bg-neutral-200 dark:bg-neutral-700 rounded-xl"></div>
      <div className="w-full h-64 bg-neutral-200 dark:bg-neutral-700 rounded-2xl"></div>
    </div>
  );
}
