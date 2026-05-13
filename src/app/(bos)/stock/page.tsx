import PageHeader from "@/src/components/ui/PageHeader";
import StockInputForm from "@/src/features/bos/stock/components/StockInputForm";
import TableInputForm from "@/src/features/bos/stock/components/TableInputForm";
import {
  getAll,
  getYesterdaySnapshot,
} from "@/src/server/bos/stock/stock.server";
import { getAllTables } from "@/src/server/bos/table/table.server";
import { getShopStatus } from "@/src/server/bos/dashboard/dashboard.server";
import LockedPage from "@/src/components/ui/LockedPage";

export default async function Page() {
  const [stockList, yesterdaySnapshot, tables, shopStatus] = await Promise.all([
    getAll(),
    getYesterdaySnapshot(),
    getAllTables(),
    getShopStatus(),
  ]);

  if (shopStatus.isBuka === 0) {
    return (
      <LockedPage 
        type="holiday" 
        customMessage="Halaman input stok harian dikunci karena status warung saat ini sedang LIBUR." 
      />
    );
  }

  const stockFormItems = stockList.map((s) => ({
    id: s.id,
    nama: s.name,
    price: s.price,
    quantity: s.quantity,
    sisaKemarin: yesterdaySnapshot[s.id] ?? 0,
  }));

  return (
    <section className="h-[calc(100dvh-45px)] md:min-h-screen dark:bg-neutral-800 flex flex-col overflow-hidden">
      <PageHeader title="Input Stock Harian" />
      <main className="relative max-w-87.5 mx-auto w-full flex flex-col h-full pt-2 sm:px-0">
        <div className="relative w-full flex flex-col h-full overflow-y-auto pb-24 scrollbar-thin scrollbar-thumb-neutral-200 dark:scrollbar-thumb-neutral-700">
          <StockInputForm 
            stockList={stockFormItems} 
            isBuka={shopStatus.isBuka === 1} 
          />
          <TableInputForm tables={tables} />
        </div>
      </main>
    </section>
  );
}
