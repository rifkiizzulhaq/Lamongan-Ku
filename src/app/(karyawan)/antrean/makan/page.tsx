"use client";

import { useState, Suspense, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import CardOrdering from "@/src/features/karyawan/pos/components/CardOrdering";
import Cart from "@/src/features/karyawan/pos/components/Cart";
import PageHeader from "@/src/components/ui/PageHeader";
import { getStock } from "@/src/server/karyawan/bungkus/bungkus.server";
import { createMakanOrder } from "@/src/server/karyawan/meja/meja.server";
import { checkIfReportedToday } from "@/src/server/karyawan/more/more.server";
import PageHeaderSkeleton from "@/src/components/ui/PageHeaderSkeleton";
import CardOrderingSkeleton from "@/src/features/karyawan/pos/components/CardOrderingSkeleton";
import { useUiStore } from "@/src/store/uiStore";
import { useCart } from "@/src/hooks/useCart";

function QuickMakanContent() {
  const { addToast, removeToast } = useUiStore();
  const router = useRouter();

  const searchParams = useSearchParams();
  const customerType = searchParams.get("tipe") || "Sendiri";

  const [isTakeaway, setIsTakeaway] = useState(false);

  const { data: isClosed = false } = useQuery({
    queryKey: ["check-reported-today"],
    queryFn: () => checkIfReportedToday(),
  });

  const { data: stockList = [], isLoading: isLoadingStock } = useQuery({
    queryKey: ["stock-list"],
    queryFn: () => getStock(),
  });

  const { cart, setCart, addToCart, removeFromCart, totalPrice } = useCart({
    initialCart: [],
  });

  const queryClient = useQueryClient();
  const [isNavigating, setIsNavigating] = useState(false);
  const loadingToastId = useRef<string | null>(null);

  const { mutate: simpan, isPending } = useMutation({
    mutationFn: async (
      payload: {
        stockId: number;
        quantity: number;
        isTakeaway?: boolean;
        price?: number;
      }[],
    ) => {
      return createMakanOrder(null, customerType, payload);
    },
    onMutate: () => {
      loadingToastId.current = addToast("Menyimpan pesanan...", "loading");
    },
    onSettled: () => {
      if (loadingToastId.current) {
        removeToast(loadingToastId.current);
      }
    },
    onSuccess: (res) => {
      if (res && res.success === false) {
        addToast(res.error || "Gagal", "error");
        return;
      }
      setIsNavigating(true);
      addToast("Pesanan berhasil disimpan!", "success");
      setCart([]);
      queryClient.invalidateQueries({ queryKey: ["active-antrean"] });
      queryClient.invalidateQueries({ queryKey: ["tables-with-orders"] });
      router.push(`/antrean`);
    },
  });

  if (isClosed) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 h-[50dvh]">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">
          Warung Tutup
        </h2>
      </div>
    );
  }

  return (
    <>
      <PageHeader title="Pesanan Meja Baru" />
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        <div className="flex-1 flex flex-col relative w-full h-[calc(100%-80px)] md:h-full pb-0 md:pb-30">
          <div className="flex-1 overflow-y-auto px-5 py-4 pb-80 md:pb-6">
            <div className="w-full mb-4 flex items-center justify-end">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <span className="text-sm font-semibold text-neutral-600 dark:text-neutral-300">
                  Semua pesanan BUNGKUS
                </span>
                <div className="relative inline-block w-12 h-6 rounded-full transition-colors duration-200 ease-in-out">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={isTakeaway}
                    onChange={(e) => setIsTakeaway(e.target.checked)}
                  />
                  <div className="block h-6 w-12 rounded-full bg-neutral-300 dark:bg-neutral-600 peer-checked:bg-orange peer-focus:ring-2 peer-focus:ring-orange/50 transition-colors duration-300"></div>
                  <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform duration-300 peer-checked:translate-x-6"></div>
                </div>
              </label>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 pb-20 md:pb-4">
              {isLoadingStock
                ? Array.from({ length: 8 }).map((_, i) => (
                    <CardOrderingSkeleton key={i} />
                  ))
                : stockList.map((s) => {
                    const currentSpecificQty =
                      cart.find(
                        (i) =>
                          i.stockId === s.id && i.isTakeaway === isTakeaway,
                      )?.quantity ?? 0;

                    return (
                      <CardOrdering
                        key={s.id}
                        name={s.name}
                        price={s.price}
                        quantity={currentSpecificQty}
                        disabled={isPending || isNavigating}
                        onAdd={() => {
                          if (isPending || isNavigating) return;
                          addToCart(s, isTakeaway);
                        }}
                        onRemove={() => {
                          if (isPending || isNavigating) return;
                          removeFromCart(s.id, isTakeaway);
                        }}
                      />
                    );
                  })}
            </div>
          </div>
        </div>
        <Cart
          mode="create"
          cart={cart}
          totalPrice={totalPrice}
          onSave={() => simpan(cart)}
          onCancel={() => router.push(`/antrean`)}
          isPending={isPending || isNavigating}
          isClosed={isClosed}
        />
      </div>
    </>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <section className="h-dvh w-full md:min-h-screen dark:bg-neutral-800 flex flex-col overflow-hidden">
          <PageHeaderSkeleton hasTag={false} />
        </section>
      }
    >
      <section className="h-dvh w-full md:min-h-screen dark:bg-neutral-800 flex flex-col overflow-hidden">
        <QuickMakanContent />
      </section>
    </Suspense>
  );
}
