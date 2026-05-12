import Button from "@/src/components/ui/Button";
import BungkusClient from "@/src/features/karyawan/bungkus/components/BungkusClient";
import Link from "next/link";
import PageHeader from "@/src/components/ui/PageHeader";
import { LuPlus } from "react-icons/lu";
import { getAll } from "@/src/server/karyawan/bungkus/bungkus.server";
import { checkIfReportedToday } from "@/src/server/karyawan/more/more.server";

export default async function Page() {
  const [antrean, isClosed] = await Promise.all([
    getAll(1, 5),
    checkIfReportedToday(),
  ]);

  const initialData = antrean.map((a) => ({
    orderId: a.id,
    id: a.label,
    totalPrice: a.totalPrice,
    status: a.status,
    items: a.items,
  }));

  return (
    <section className="h-[calc(100dvh-45px)] md:min-h-screen dark:bg-neutral-800 flex flex-col overflow-hidden">
      <PageHeader title="Antrean Bungkus" />
      <main className="relative max-w-87.5 mx-auto w-full flex-1 flex flex-col overflow-hidden pt-2">
        <div className="absolute bottom-15 right-0 z-50">
          {isClosed ? (
            <div className="flex items-center gap-1 bg-neutral-400 text-white cursor-not-allowed shadow-lg font-bold py-2 px-3 rounded-full opacity-60">
              Warung Tutup
            </div>
          ) : (
            <Link href="/bungkus/ordering">
              <Button className="flex items-center gap-1 dark:bg-white bg-neutral-800 text-white hover:bg-neutral-200 shadow-lg dark:text-black font-bold py-2 px-3 rounded-full scale-100 active:scale-95 transition-transform">
                <LuPlus size={24} strokeWidth={3} />
                Tambah Pesanan
              </Button>
            </Link>
          )}
        </div>

        <BungkusClient initialData={initialData} />
      </main>
    </section>
  );
}
