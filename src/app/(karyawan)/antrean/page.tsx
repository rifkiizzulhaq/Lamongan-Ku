"use client";

import PageHeader from "@/src/components/ui/PageHeader";
import dynamic from "next/dynamic";
import { LuLoader } from "react-icons/lu";

const AntreanClient = dynamic(
  () => import("@/src/features/karyawan/antrean/components/AntreanClient"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full flex justify-center py-10">
        <LuLoader className="animate-spin text-orange text-3xl" />
      </div>
    ),
  },
);

export default function Page() {
  return (
    <section className="h-[calc(100dvh-45px)] md:min-h-screen dark:bg-neutral-800 flex flex-col overflow-hidden">
      <PageHeader title="Daftar Antrean" />
      <main className="relative max-w-87.5 mx-auto w-full flex-1 flex flex-col overflow-hidden pt-2">
        <AntreanClient />
      </main>
    </section>
  );
}
