export default function CardMejaSkeleton() {
  return (
    <div className="w-[calc(50%-0.5rem)] h-28 flex bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden shadow-sm animate-pulse">
      <div className="w-2 h-full shrink-0 bg-neutral-200 dark:bg-neutral-700"></div>
      <div className="flex-1 flex flex-col justify-between py-3 px-3">
        <div className="w-2/3 h-6 bg-neutral-200 dark:bg-neutral-600 rounded-md"></div>
        <div className="flex flex-col gap-1.5 mt-auto">
          <div className="w-1/2 h-3 bg-neutral-200 dark:bg-neutral-600 rounded-md"></div>
          <div className="w-1/3 h-4 bg-neutral-200 dark:bg-neutral-600 rounded-md mt-1"></div>
        </div>
      </div>
    </div>
  );
}
