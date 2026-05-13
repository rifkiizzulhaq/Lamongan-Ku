export default function DashboardSkeleton() {
  return (
    <div className="w-full h-full flex flex-col pt-2 px-4 animate-pulse">
      <div className="w-full h-16 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl mb-6 shadow-sm"></div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {[1, 2, 3, 4, 5].map((i) => (
          <div 
            key={i} 
            className="w-full h-32 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-5 shadow-sm"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 bg-neutral-100 dark:bg-neutral-700 rounded-xl"></div>
              <div className="w-16 h-4 bg-neutral-100 dark:bg-neutral-700 rounded"></div>
            </div>
            <div className="w-3/4 h-6 bg-neutral-100 dark:bg-neutral-700 rounded"></div>
          </div>
        ))}
      </div>

      <div className="w-full h-80 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-3xl shadow-sm p-6">
        <div className="w-1/4 h-6 bg-neutral-100 dark:bg-neutral-700 rounded mb-8"></div>
        <div className="w-full h-56 bg-neutral-50 dark:bg-neutral-700/30 rounded-xl"></div>
      </div>
    </div>
  );
}
