"use client";

import { useQuery } from "@tanstack/react-query";
import CardMeja from "@/src/features/karyawan/meja/components/CardMeja";
import CardMejaSkeleton from "@/src/features/karyawan/meja/components/CardMejaSkeleton";
import PageHeader from "@/src/components/ui/PageHeader";
import PageHeaderSkeleton from "@/src/components/ui/PageHeaderSkeleton";
import { getTablesWithOrders } from "@/src/server/karyawan/meja/meja.server";
import { useSupabaseRealtime } from "@/src/hooks/useSupabaseRealtime";

export default function Meja() {
  useSupabaseRealtime("orders", ["tables-karyawan"]);

  const { data: tables = [], isLoading } = useQuery({
    queryKey: ["tables-karyawan"],
    queryFn: () => getTablesWithOrders(),
  });

  if (isLoading) {
    return (
      <section className="h-[calc(100dvh-64px)] md:min-h-screen dark:bg-neutral-800 flex flex-col overflow-hidden">
        <PageHeaderSkeleton />
        <main className="relative max-w-87.5 mx-auto w-full flex-1 flex flex-col overflow-hidden pt-2">
          <div className="flex-1 w-full flex gap-3 flex-wrap content-start overflow-y-auto pb-24">
            {[...Array(6)].map((_, i) => (
              <CardMejaSkeleton key={i} />
            ))}
          </div>
        </main>
      </section>
    );
  }

  return (
    <section className="h-[calc(100dvh-64px)] md:min-h-screen dark:bg-neutral-800 flex flex-col overflow-hidden">
      <PageHeader title="Makan di tempat" />
      <main className="relative max-w-87.5 mx-auto w-full flex flex-col h-full pt-2">
        <div className="flex-1 w-full flex gap-3 flex-wrap content-start overflow-y-auto pb-24 pr-1 scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-700">
          {tables.length === 0 ? (
            <div className="w-full text-center py-10 text-neutral-500 italic border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-xl">
              Belum ada meja. Bos harus menambah meja di halaman stok.
            </div>
          ) : (
            tables.map((table) => (
              <CardMeja
                key={table.id}
                id={table.id}
                name={table.name}
                totalItems={table.activeOrdersCount}
                isActive={table.activeOrdersCount > 0}
              />
            ))
          )}
        </div>
      </main>
    </section>
  );
}
