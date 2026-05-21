export default function CardRiwayatSkeleton({ count }: { count?: number }) {
  const skeletonCount = count || 5;
  return (
    <div className="flex-1 w-full flex flex-col gap-3">
      {[...Array(skeletonCount)].map((_, index) => (
        <section
          key={index}
          className="w-full bg-white dark:bg-neutral-700 rounded-xl border border-neutral-300 dark:border-neutral-600 flex items-stretch shadow-sm animate-pulse"
        >
          <div className="w-2 bg-neutral-200 dark:bg-neutral-600 rounded-l-xl shrink-0"></div>
          <div className="flex flex-col px-5 py-4 w-full">
            <div className="w-full flex items-center justify-between mb-2">
              <div className="h-6 bg-neutral-200 dark:bg-neutral-600 rounded w-1/3"></div>
              <div className="h-6 bg-neutral-200 dark:bg-neutral-600 rounded w-1/4"></div>
            </div>
            <div className="h-4 bg-neutral-200 dark:bg-neutral-600 rounded w-1/4 mb-4"></div>

            <div className="w-full flex flex-wrap content-start gap-2 bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-200/60 dark:border-neutral-800 rounded-lg p-2.5">
              <div className="h-7 bg-neutral-200 dark:bg-neutral-600 rounded w-20"></div>
              <div className="h-7 bg-neutral-200 dark:bg-neutral-600 rounded w-24"></div>
              <div className="h-7 bg-neutral-200 dark:bg-neutral-600 rounded w-16"></div>
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
