"use client";

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
import { useQuery } from "@tanstack/react-query";
import StockSkeleton from "@/src/features/bos/stock/components/StockSkeleton";

export default function Page() {
  const { data: stockList = [], isLoading: isLoadingStock } = useQuery({
    queryKey: ["stock-list"],
    queryFn: () => getAll(),
  });

  const { data: yesterdaySnapshot = {}, isLoading: isLoadingSnapshot } =
    useQuery({
      queryKey: ["yesterday-snapshot"],
      queryFn: () => getYesterdaySnapshot(),
    });

  const { data: tables = [], isLoading: isLoadingTables } = useQuery({
    queryKey: ["tables"],
    queryFn: () => getAllTables(),
  });

  const { data: shopStatus, isLoading: isLoadingStatus } = useQuery({
    queryKey: ["shop-status"],
    queryFn: () => getShopStatus(),
  });

  const isLoading =
    isLoadingStock || isLoadingSnapshot || isLoadingTables || isLoadingStatus;

  if (isLoading) {
    return (
      <section className="h-[calc(100dvh-45px)] md:min-h-screen dark:bg-neutral-800 flex flex-col overflow-hidden">
        <PageHeader title="Input Stock Harian" />
        <main className="relative max-w-87.5 mx-auto w-full flex flex-col h-full pt-2 sm:px-0">
          <div className="flex-1 w-full flex justify-center items-center">
            <StockSkeleton count={12} />
          </div>
        </main>
      </section>
    );
  }

  if (shopStatus?.isBuka === 0) {
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
            isBuka={shopStatus?.isBuka === 1}
            hasYesterdayData={Object.keys(yesterdaySnapshot).length > 0}
          />
          <TableInputForm tables={tables} />
        </div>
      </main>
    </section>
  );
}
