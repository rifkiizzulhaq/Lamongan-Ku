import PageHeaderSkeleton from "@/src/components/ui/PageHeaderSkeleton";
import CardBungkusSkeleton from "@/src/features/karyawan/bungkus/components/CardBungkusSkeleton";

export default function Loading() {
  return (
    <section className="h-[calc(100dvh-64px)] md:min-h-screen dark:bg-neutral-800 flex flex-col overflow-hidden">
      <PageHeaderSkeleton />
      <main className="relative max-w-87.5 mx-auto w-full flex-1 flex flex-col overflow-hidden pt-2">
        <div className="flex-1 overflow-y-auto flex flex-col gap-4 pb-10">
          {[...Array(4)].map((_, i) => (
            <CardBungkusSkeleton key={i} />
          ))}
        </div>
      </main>
    </section>
  );
}