import PageHeader from "@/src/components/ui/PageHeader";
import RiwayatClient from "@/src/features/karyawan/riwayat/components/RiwayatClient";
import { getHistory } from "@/src/server/karyawan/riwayat/riwayat.server";

export const dynamic = "force-dynamic";

export default async function Page() {
  const historyData = await getHistory(1, 5);

  return (
    <section className="h-[calc(100dvh-45px)] md:min-h-screen dark:bg-neutral-800 flex flex-col overflow-hidden">
      <PageHeader title="Riwayat" />
      <main className="relative max-w-87.5 mx-auto w-full flex flex-col h-full pt-2">
        <RiwayatClient initialData={historyData} />
      </main>
    </section>
  );
}
