import Button from "@/src/components/ui/Button";
import CardBungkus from "@/src/features/karyawan/bungkus/components/CardBungkus";
import Link from "next/link";
import PageHeader from "@/src/components/ui/PageHeader";
import { LuPlus } from "react-icons/lu";

const dummyAntreanBungkus = [
  {
    id: "Bungkus #01",
    totalPrice: 25000,
    status: "Sedang Diproses..",
    items: [
      { n: "Ayam Goreng", q: 1 },
      { n: "Nasi Putih", q: 2 },
      { n: "Es Teh Manis", q: 1 },
      { n: "Es Teh Manis", q: 1 },
      { n: "Es Teh Manis", q: 1 },
    ],
  },
  {
    id: "Bungkus #02",
    totalPrice: 45000,
    status: "Sedang Diproses..",
    items: [
      { n: "Lele Goreng", q: 2 },
      { n: "Nasi Putih", q: 3 },
      { n: "Tempe/Tahu", q: 4 },
      { n: "Es Jeruk", q: 2 },
    ],
  },
  {
    id: "Bungkus #03",
    totalPrice: 35000,
    status: "Sedang Diproses..",
    items: [
      { n: "Bebek Jumbo", q: 1 },
      { n: "Nasi Putih", q: 1 },
      { n: "Sambal Extra", q: 1 },
    ],
  },
];

export default function Page() {
  return (
    <section className="h-[calc(100dvh-45px)] md:min-h-screen dark:bg-neutral-800 flex flex-col overflow-hidden">
      <PageHeader title="Antrean Bungkus" />
      <main className="relative max-w-87.5 mx-auto w-full flex flex-col h-full pt-2">
        <div className="absolute bottom-25 right-0 z-50">
          <Link href="/bungkus/ordering">
            <Button className="flex items-center gap-1 dark:bg-white bg-neutral-800 text-white hover:bg-neutral-200 shadow-lg dark:text-black font-bold py-2 px-3 rounded-full scale-100 active:scale-95 transition-transform">
              <LuPlus size={24} strokeWidth={3} />
              Tambah Pesanan
            </Button>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto flex flex-col gap-4 pb-40 pr-1 scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-700">
          {dummyAntreanBungkus.map((pesanan, idx) => (
            <CardBungkus
              key={idx}
              id={pesanan.id}
              totalPrice={pesanan.totalPrice}
              status={pesanan.status}
              items={pesanan.items}
            />
          ))}
        </div>
      </main>
    </section>
  );
}
