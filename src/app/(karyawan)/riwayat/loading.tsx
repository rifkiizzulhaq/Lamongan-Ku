import PageHeaderSkeleton from "@/src/components/ui/PageHeaderSkeleton";
import CardRiwayatSkeleton from "@/src/features/karyawan/riwayat/components/CardRiwayatSkeleton";

export default function Loading() {
  return (
    <section className="h-[calc(100dvh-45px)] w-full md:min-h-screen dark:bg-neutral-800 flex flex-col overflow-hidden">
      <PageHeaderSkeleton />
      <main className="relative max-w-87.5 mx-auto w-full flex-1 flex flex-col overflow-hidden pt-2">
        <div className="flex-1 overflow-y-auto flex flex-col gap-3 pb-24 pr-1 content-start">
          {[...Array(5)].map((_, i) => (
            <CardRiwayatSkeleton key={i} />
          ))}
        </div>
      </main>
    </section>
  );
}
