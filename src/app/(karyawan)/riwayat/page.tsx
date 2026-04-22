import PageHeader from "@/src/components/ui/PageHeader";
import CardRiwayat, {
  OrderHistory,
} from "@/src/components/riwayat/CardRiwayat";

const DUMMY_HISTORY: OrderHistory[] = [
  {
    id: "#ORD-001",
    type: "Meja",
    tableNumber: 4,
    date: "22 Apr 2026, 12:30",
    total: 45000,
    status: "Selesai",
  },
  {
    id: "#ORD-002",
    type: "Bungkus",
    date: "22 Apr 2026, 13:15",
    total: 25000,
    status: "Selesai",
  },
  {
    id: "#ORD-003",
    type: "Meja",
    tableNumber: 12,
    date: "22 Apr 2026, 14:00",
    total: 62000,
    status: "Dibatalkan",
  },
  {
    id: "#ORD-004",
    type: "Bungkus",
    date: "22 Apr 2026, 14:45",
    total: 155000,
    status: "Selesai",
  },
];

export default function Page() {
  return (
    <section className="h-[calc(100dvh-45px)] md:min-h-screen dark:bg-neutral-800 flex flex-col overflow-hidden">
      <PageHeader title="Riwayat" />
      <main className="relative max-w-87.5 mx-auto w-full flex flex-col h-full pt-2">
        <div className="flex-1 w-full flex gap-3 flex-col content-start overflow-y-auto pb-24 pr-1 scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-700">
          {DUMMY_HISTORY.map((item) => (
            <CardRiwayat key={item.id} data={item} />
          ))}
        </div>
      </main>
    </section>
  );
}
