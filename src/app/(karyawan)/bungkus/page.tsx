import Button from "@/src/components/ui/Button";
import CardBungkus from "@/src/features/karyawan/bungkus/components/CardBungkus";
import Link from "next/link";
import PageHeader from "@/src/components/ui/PageHeader";
import { LuPlus } from "react-icons/lu";
import { getAll } from "@/src/server/karyawan/bungkus/bungkus.server";

export default async function Page() {
  const antrean = await getAll();

  return (
    <section className="h-[calc(100dvh-45px)] md:min-h-screen dark:bg-neutral-800 flex flex-col overflow-hidden">
      <PageHeader title="Antrean Bungkus" />
      <main className="relative max-w-87.5 mx-auto w-full flex flex-col h-full pt-2">
        <div className="absolute bottom-10 right-0 z-50">
          <Link href="/bungkus/ordering">
            <Button className="flex items-center gap-1 dark:bg-white bg-neutral-800 text-white hover:bg-neutral-200 shadow-lg dark:text-black font-bold py-2 px-3 rounded-full scale-100 active:scale-95 transition-transform">
              <LuPlus size={24} strokeWidth={3} />
              Tambah Pesanan
            </Button>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto flex flex-col gap-4 pb-40 pr-1 scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-700">
          {antrean.length === 0 ? (
            <p className="text-center text-neutral-400 dark:text-neutral-600 text-sm mt-10">
              Belum ada pesanan bungkus.
            </p>
          ) : (
            antrean.map((pesanan) => (
              <CardBungkus
                key={pesanan.id}
                orderId={pesanan.id}
                id={pesanan.label}
                totalPrice={pesanan.totalPrice}
                status={pesanan.status}
                items={pesanan.items}
              />
            ))
          )}
        </div>
      </main>
    </section>
  );
}
