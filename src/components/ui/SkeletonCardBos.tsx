export default function SkeletonCardBos() {
  return (
    <div className="h-full w-full max-w-87.5 mx-auto p-4 flex flex-col gap-6 animate-pulse pt-6">
      <div className="w-1/2 h-10 bg-neutral-200 dark:bg-neutral-800 rounded-xl"></div>
      <div className="flex flex-col gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-20 w-full bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-100 dark:border-neutral-700 flex items-center px-4"
          >
            <div className="w-12 h-12 bg-neutral-200 dark:bg-neutral-700 rounded-full mr-4"></div>
            <div className="flex flex-col gap-2 flex-1">
              <div className="w-1/3 h-4 bg-neutral-200 dark:bg-neutral-700 rounded-md"></div>
              <div className="w-1/4 h-3 bg-neutral-200 dark:bg-neutral-700 rounded-md"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
