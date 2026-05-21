export default function StockSkeleton({ count }: { count?: number }) {
  const skeletonCount = count || 12;
  return (
    <section className="flex flex-col gap-2 w-full">
      {[...Array(skeletonCount)].map((_, index) => (
        <div
          key={index}
          className="w-full h-36 bg-white dark:bg-neutral-700 rounded-xl border border-neutral-300 dark:border-neutral-600 shadow-sm animate-pulse flex flex-col justify-between p-3"
        >
          <div className="flex flex-col gap-2">
            <div className="w-full h-5 bg-neutral-200 dark:bg-neutral-600 rounded-md"></div>
            <div className="w-3/4 h-4 bg-neutral-200 dark:bg-neutral-600 rounded-md"></div>
          </div>
          <div className="flex justify-between">
            <div className="w-1/3 h-6 bg-neutral-200 dark:bg-neutral-600 rounded-md"></div>
            <div className="w-1/3 h-6 bg-neutral-200 dark:bg-neutral-600 rounded-md"></div>
          </div>
        </div>
      ))}
    </section>
  );
}
