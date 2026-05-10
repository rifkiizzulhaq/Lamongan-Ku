export default function CardBungkusSkeleton() {
  return (
    <div className="w-full h-48 bg-white dark:bg-neutral-700 rounded-xl border border-neutral-300 dark:border-neutral-600 flex items-center justify-between shadow-sm animate-pulse overflow-hidden">
      <div className="w-2 h-full bg-neutral-200 dark:bg-neutral-600 shrink-0"></div>
      <div className="w-full h-full flex flex-col justify-between">
        <div className="flex flex-col px-5 py-3 flex-1">
          <div className="w-full flex items-center justify-between">
            <div className="w-1/3 h-5 bg-neutral-200 dark:bg-neutral-600 rounded-md"></div>
            <div className="w-1/4 h-5 bg-neutral-200 dark:bg-neutral-600 rounded-md"></div>
          </div>
          <div className="w-full flex items-center mt-3">
            <div className="w-1/4 h-4 bg-neutral-200 dark:bg-neutral-600 rounded-md"></div>
          </div>
          <div className="w-full flex gap-2 bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-200/60 dark:border-neutral-800 rounded-lg p-2.5 mt-4 h-16">
            <div className="w-16 h-6 bg-neutral-200 dark:bg-neutral-600 rounded-md"></div>
            <div className="w-16 h-6 bg-neutral-200 dark:bg-neutral-600 rounded-md"></div>
          </div>
        </div>
        <div className="flex w-full">
          <div className="h-12 w-16 shrink-0 bg-neutral-200 dark:bg-neutral-600"></div>
          <div className="h-12 flex-1 bg-neutral-300 dark:bg-neutral-800 rounded-br-xl"></div>
        </div>
      </div>
    </div>
  );
}
