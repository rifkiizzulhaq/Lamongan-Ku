import PageHeaderSkeleton from "@/src/components/ui/PageHeaderSkeleton";
import CardOrderingSkeleton from "@/src/features/karyawan/pos/components/CardOrderingSkeleton";

export default function Loading() {
  return (
    <section className="h-[calc(100dvh-45px)] w-full md:min-h-screen dark:bg-neutral-800 flex flex-col overflow-hidden">
      <PageHeaderSkeleton hasTag />
      <main className="relative max-w-87.5 mx-auto w-full flex-1 flex flex-col overflow-hidden pt-2">
        <div className="flex-1 overflow-y-auto grid grid-cols-2 gap-2 pb-5 content-start">
          {[...Array(8)].map((_, i) => (
            <CardOrderingSkeleton key={i} />
          ))}
        </div>
      </main>
    </section>
  );
}
