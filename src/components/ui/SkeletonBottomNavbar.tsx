"use client";

export default function SkeletonBottomNavbar() {
  return (
    <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800">
      <div className="grid h-full max-w-lg grid-cols-4 mx-auto font-medium">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="inline-flex flex-col items-center justify-center px-5 py-3"
          >
            <div className="w-6 h-6 rounded-md bg-neutral-200 dark:bg-neutral-700 animate-pulse mb-1" />
            <div className="w-10 h-2 rounded-md bg-neutral-200 dark:bg-neutral-700 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
