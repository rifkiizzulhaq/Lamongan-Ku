import PageHeader from "@/src/components/ui/PageHeader";
import BungkusOrderingClient from "@/src/features/karyawan/bungkus/components/BungkusOrderingClient";
import {
  getStock,
  getOrderById,
} from "@/src/server/karyawan/bungkus/bungkus.server";

interface PageProps {
  searchParams: Promise<{ mode?: string; orderId?: string }>;
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const isUpdate = params.mode === "update";
  const orderId = params.orderId ? parseInt(params.orderId) : undefined;

  const [stockList, existingOrder] = await Promise.all([
    getStock(),
    isUpdate && orderId ? getOrderById(orderId) : Promise.resolve(null),
  ]);

  return (
    <section className="h-[calc(100dvh-45px)] w-full md:min-h-screen dark:bg-neutral-800 flex flex-col overflow-hidden">
      <PageHeader
        title={isUpdate ? "Update Pesanan" : "Pesanan Baru"}
        tag="ordering"
      />
      <BungkusOrderingClient
        stockList={stockList}
        mode={isUpdate ? "update" : "create"}
        orderId={orderId}
        initialCart={existingOrder?.cartItems ?? []}
      />
    </section>
  );
}
