"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import PageHeader from "@/src/components/ui/PageHeader";
import PageHeaderSkeleton from "@/src/components/ui/PageHeaderSkeleton";
import BungkusOrderingClient from "@/src/features/karyawan/bungkus/components/BungkusOrderingClient";
import CardOrderingSkeleton from "@/src/features/karyawan/pos/components/CardOrderingSkeleton";
import {
  getStock,
  getOrderById,
} from "@/src/server/karyawan/bungkus/bungkus.server";

function OrderingContent() {
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") === "update" ? "update" : "create";
  const orderIdStr = searchParams.get("orderId");
  const orderId = orderIdStr ? parseInt(orderIdStr) : undefined;

  const { data: stockList = [], isLoading: isLoadingStock } = useQuery({
    queryKey: ["stock-list"],
    queryFn: () => getStock(),
  });

  const { data: existingOrder, isLoading: isLoadingOrder } = useQuery({
    queryKey: ["bungkus-order", orderId],
    queryFn: () => getOrderById(orderId!),
    enabled: mode === "update" && !!orderId,
  });

  if (isLoadingStock || (mode === "update" && isLoadingOrder)) {
    return (
      <section className="h-[calc(100dvh-45px)] w-full md:min-h-screen dark:bg-neutral-800 flex flex-col overflow-hidden">
        <PageHeaderSkeleton hasTag />
        <main className="relative max-w-87.5 mx-auto w-full flex-1 flex flex-col overflow-hidden pt-2">
          <div className="flex-1 overflow-y-auto grid grid-cols-2 gap-2 pb-5 content-start">
            {[...Array(8)].map((_, i) => (
              <CardOrderingSkeleton key={i} />
            ))}
          </div>
        </main>
      </section>
    );
  }

  return (
    <section className="h-[calc(100dvh-45px)] w-full md:min-h-screen dark:bg-neutral-800 flex flex-col overflow-hidden">
      <PageHeader
        title={mode === "update" ? "Update Pesanan" : "Pesanan Baru"}
        tag="ordering"
      />
      <BungkusOrderingClient
        stockList={stockList}
        mode={mode}
        orderId={orderId}
        initialCart={existingOrder?.cartItems ?? []}
      />
    </section>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <section className="h-[calc(100dvh-45px)] w-full md:min-h-screen dark:bg-neutral-800 flex flex-col overflow-hidden">
          <PageHeaderSkeleton hasTag />
        </section>
      }
    >
      <OrderingContent />
    </Suspense>
  );
}
