export default function SkeletonCard() {
  return (
    <div className="h-full w-full max-w-87.5 mx-auto p-4 flex flex-col gap-4 animate-pulse pt-6">
      <div className="flex justify-between items-center mb-2">
        <div className="w-1/3 h-8 bg-neutral-200 dark:bg-neutral-800 rounded-lg"></div>
        <div className="w-10 h-10 bg-neutral-200 dark:bg-neutral-800 rounded-full"></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-32 bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-100 dark:border-neutral-700 shadow-sm"
          >
            <div className="p-4 h-full flex flex-col justify-between">
              <div className="w-3/4 h-5 bg-neutral-200 dark:bg-neutral-700 rounded-md"></div>
              <div className="w-1/2 h-4 bg-neutral-200 dark:bg-neutral-700 rounded-md"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
