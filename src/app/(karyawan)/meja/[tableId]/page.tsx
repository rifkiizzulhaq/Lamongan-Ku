"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import PageHeader from "@/src/components/ui/PageHeader";
import PageHeaderSkeleton from "@/src/components/ui/PageHeaderSkeleton";
import CardKursi from "@/src/features/karyawan/meja/components/CardKursi";
import CardKursiSkeleton from "@/src/features/karyawan/meja/components/CardKursiSkeleton";
import { LuUsers, LuUtensils, LuUser, LuPlus } from "react-icons/lu";
import Button from "@/src/components/ui/Button";
import { getOrdersByTable, getTableById } from "@/src/server/karyawan/meja/meja.server";

export default function Page() {
  const params = useParams();
  const tableIdStr = Array.isArray(params?.tableId) ? params.tableId[0] : params?.tableId;
  const tableId = tableIdStr ? parseInt(tableIdStr, 10) : 0;

  const [open, setOpen] = useState(false);

  const { data: table } = useQuery({
    queryKey: ["table", tableId],
    queryFn: () => getTableById(tableId),
    enabled: !!tableId,
  });

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["table-orders", tableId],
    queryFn: () => getOrdersByTable(tableId),
    enabled: !!tableId,
  });

  const modeOptions = [
    {
      label: "Rombongan",
      href: `/meja/${tableId}/makan?tipe=Rombongan`,
      icon: <LuUsers />,
    },
    {
      label: "Makan Bareng",
      href: `/meja/${tableId}/makan?tipe=Makan Bareng`,
      icon: <LuUtensils />,
    },
    { 
      label: "Sendiri", 
      href: `/meja/${tableId}/makan?tipe=Sendiri`, 
      icon: <LuUser /> 
    },
  ];

  if (isLoading) {
    return (
      <section className="h-[calc(100dvh-45px)] md:min-h-screen dark:bg-neutral-800 flex flex-col overflow-hidden">
        <PageHeaderSkeleton hasTag />
        <main className="relative max-w-87.5 mx-auto w-full flex-1 flex flex-col overflow-hidden pt-2">
          <div className="flex-1 overflow-y-auto flex flex-col gap-4 pb-30">
            {[...Array(4)].map((_, i) => (
              <CardKursiSkeleton key={i} />
            ))}
          </div>
        </main>
      </section>
    );
  }

  return (
    <section className="h-[calc(100dvh-45px)] md:min-h-screen dark:bg-neutral-800 flex flex-col overflow-hidden">
      <PageHeader title={table?.name || "Meja"} tag="Makan di tempat" />
      <main className="relative max-w-87.5 mx-auto w-full flex-1 flex flex-col overflow-hidden pt-2">
        <div className="absolute bottom-15 right-0 z-50 flex flex-col items-end gap-2">
          {open && (
            <div className="flex flex-col items-end gap-2">
              {modeOptions.map((opt) => (
                <Link
                  key={opt.label}
                  href={opt.href}
                  onClick={() => setOpen(false)}
                >
                  <div className="flex items-center gap-2">
                    <span className="bg-white dark:bg-neutral-900 text-neutral-800 dark:text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md border border-neutral-200 dark:border-neutral-700 whitespace-nowrap">
                      {opt.label}
                    </span>
                    <span className="w-10 h-10 rounded-full bg-neutral-800 dark:bg-white text-white dark:text-black flex items-center justify-center shadow-lg text-base">
                      {opt.icon}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <Button
            onClick={() => setOpen((v) => !v)}
            className={`w-12 h-12 rounded-full shadow-lg font-black text-xl flex items-center justify-center transition-all duration-200 active:scale-95 ${
              open
                ? "bg-orange text-white rotate-45"
                : "bg-neutral-800 dark:bg-white text-white dark:text-black"
            }`}
          >
            <LuPlus size={24} strokeWidth={3} />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto flex flex-col gap-4 pb-30 scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-700">
          {orders.length === 0 ? (
            <div className="w-full text-center py-10 text-neutral-500 italic border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-xl">
              Belum ada pesanan di meja ini.
            </div>
          ) : (
            orders.map((order, idx) => (
              <CardKursi
                key={order.id}
                id={`O-${order.id}`}
                tableId={tableId}
                orderId={order.id}
                totalPrice={order.totalPrice}
                status={order.status}
                items={order.items}
                label=""
                tipe={order.tipe}
              />
            ))
          )}
        </div>
      </main>
    </section>
  );
}
