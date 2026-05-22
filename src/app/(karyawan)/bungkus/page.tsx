"use client";

import BungkusClient from "@/src/features/karyawan/bungkus/components/BungkusClient";
import PageHeader from "@/src/components/ui/PageHeader";
import { checkIfReportedToday } from "@/src/server/karyawan/more/more.server";
import { useQuery } from "@tanstack/react-query";

export default function Page() {
  const { data: isClosed = false } = useQuery({
    queryKey: ["check-reported-today", new Date().toDateString()],
    queryFn: () => checkIfReportedToday(),
  });

  return (
    <section className="h-[calc(100dvh-45px)] md:min-h-screen dark:bg-neutral-800 flex flex-col overflow-hidden">
      <PageHeader title="Antrean Bungkus" />
      <main className="relative max-w-87.5 mx-auto w-full flex-1 flex flex-col overflow-hidden pt-2">
        <BungkusClient isClosed={isClosed} />
      </main>
    </section>
  );
}
