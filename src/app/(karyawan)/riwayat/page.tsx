"use client";

import PageHeader from "@/src/components/ui/PageHeader";
import RiwayatClient from "@/src/features/karyawan/riwayat/components/RiwayatClient";

export default function Page() {
  return (
    <section className="h-[calc(100dvh-45px)] md:min-h-screen dark:bg-neutral-800 flex flex-col overflow-hidden">
      <PageHeader title="Riwayat" />
      <main className="relative max-w-87.5 mx-auto w-full flex flex-col h-full pt-2">
        <RiwayatClient />
      </main>
    </section>
  );
}
