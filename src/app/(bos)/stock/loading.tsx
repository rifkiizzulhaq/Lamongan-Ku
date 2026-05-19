import PageHeaderSkeleton from "@/src/components/ui/PageHeaderSkeleton";

export default function Loading() {
  return (
    <section className="h-[calc(100dvh-45px)] md:min-h-screen dark:bg-neutral-800 flex flex-col overflow-hidden">
      <PageHeaderSkeleton />
      <main className="relative max-w-87.5 mx-auto w-full flex flex-col h-full pt-2 sm:px-0">
        <div className="relative w-full flex flex-col h-full overflow-y-auto pb-24 gap-5">
          <div className="w-full flex flex-col gap-5">
            <div className="w-full h-20 bg-neutral-200 dark:bg-neutral-700 rounded-2xl animate-pulse"></div>
            <div className="w-full h-64 bg-neutral-200 dark:bg-neutral-700 rounded-2xl animate-pulse"></div>
          </div>
          <div className="w-full h-40 bg-neutral-200 dark:bg-neutral-700 rounded-2xl animate-pulse"></div>
        </div>
      </main>
    </section>
  );
}
