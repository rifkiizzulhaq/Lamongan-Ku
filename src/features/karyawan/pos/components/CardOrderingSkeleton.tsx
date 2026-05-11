export default function CardOrderingSkeleton() {
  return (
    <div className="w-full h-30 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden shadow-sm animate-pulse">
      <div className="w-2 h-full bg-neutral-200 dark:bg-neutral-700 float-left"></div>
      <div className="flex flex-col items-center justify-center h-full gap-2 px-4">
        <div className="w-1/2 h-4 bg-neutral-200 dark:bg-neutral-700 rounded-md mt-4"></div>
        <div className="w-1/3 h-3 bg-neutral-200 dark:bg-neutral-700 rounded-md"></div>
        <div className="w-14 h-6 bg-neutral-200 dark:bg-neutral-700 rounded-md mt-2"></div>
      </div>
    </div>
  );
}
