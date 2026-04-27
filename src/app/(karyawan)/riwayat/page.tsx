import PageHeader from "@/src/components/ui/PageHeader";
import CardRiwayat from "@/src/features/karyawan/riwayat/components/CardRiwayat";

const dummyRiwayat = [
  {
    id: "Bungkus #03",
    date: "25 Apr 2026, 14:30",
    totalPrice: 35000,
    items: [
      { n: "Bebek Jumbo", q: 1 },
      { n: "Nasi Putih", q: 1 },
      { n: "Sambal Extra", q: 1 },
    ],
  },
  {
    id: "Meja 2",
    date: "25 Apr 2026, 13:45",
    totalPrice: 85000,
    items: [
      { n: "Ayam Bakar", q: 2 },
      { n: "Nasi Putih", q: 2 },
      { n: "Es Jeruk", q: 2 },
      { n: "Tahu Tempe", q: 1 },
    ],
  },
  {
    id: "Bungkus #02",
    date: "25 Apr 2026, 12:15",
    totalPrice: 45000,
    items: [
      { n: "Lele Goreng", q: 2 },
      { n: "Nasi Putih", q: 3 },
      { n: "Tempe/Tahu", q: 4 },
      { n: "Es Jeruk", q: 2 },
    ],
  },
  {
    id: "Meja 5",
    date: "25 Apr 2026, 11:20",
    totalPrice: 120000,
    items: [
      { n: "Ayam Goreng", q: 4 },
      { n: "Nasi Putih", q: 4 },
      { n: "Es Teh Manis", q: 4 },
      { n: "Sate Usus", q: 4 },
      { n: "Sate Usus", q: 4 },
      { n: "Sate Usus", q: 4 },
    ],
  },
];

export default function Page() {
  return (
    <section className="h-[calc(100dvh-45px)] md:min-h-screen dark:bg-neutral-800 flex flex-col overflow-hidden">
      <PageHeader title="Riwayat" />
      <main className="relative max-w-87.5 mx-auto w-full flex flex-col h-full pt-2">
        <div className="flex-1 w-full flex gap-3 flex-col content-start overflow-y-auto pb-24 pr-1 scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-700">
          {dummyRiwayat.map((riwayat, idx) => (
            <CardRiwayat
              key={idx}
              id={riwayat.id}
              date={riwayat.date}
              totalPrice={riwayat.totalPrice}
              items={riwayat.items}
            />
          ))}
        </div>
      </main>
    </section>
  );
}
