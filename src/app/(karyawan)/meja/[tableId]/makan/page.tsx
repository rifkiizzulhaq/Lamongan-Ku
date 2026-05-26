"use client";

import { useState, Suspense, useEffect, useRef } from "react";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import CardOrdering from "@/src/features/karyawan/pos/components/CardOrdering";
import Cart from "@/src/features/karyawan/pos/components/Cart";
import PageHeader from "@/src/components/ui/PageHeader";
import { getStock } from "@/src/server/karyawan/bungkus/bungkus.server";
import {
  getOrderById,
  createMakanOrder,
  updateMakanItems,
} from "@/src/server/karyawan/meja/meja.server";
import { checkIfReportedToday } from "@/src/server/karyawan/more/more.server";
import PageHeaderSkeleton from "@/src/components/ui/PageHeaderSkeleton";
import CardOrderingSkeleton from "@/src/features/karyawan/pos/components/CardOrderingSkeleton";
import { useUiStore } from "@/src/store/uiStore";
import { useNotificationStore } from "@/src/store/notificationStore";
import { useCart } from "@/src/hooks/useCart";

function MakanContent() {
  const { addToast, removeToast } = useUiStore();
  const router = useRouter();
  const params = useParams();
  const tableIdStr = Array.isArray(params?.tableId)
    ? params.tableId[0]
    : params?.tableId;
  const tableId = tableIdStr ? parseInt(tableIdStr, 10) : 0;

  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") === "update" ? "update" : "create";
  const orderIdStr = searchParams.get("orderId");
  const orderId = orderIdStr ? parseInt(orderIdStr, 10) : undefined;
  const customerType = searchParams.get("tipe") || "Sendiri";

  const [isTakeaway, setIsTakeaway] = useState(false);
  const [initialCartLoaded, setInitialCartLoaded] = useState(mode === "create");

  const { data: isClosed = false } = useQuery({
    queryKey: ["check-reported-today"],
    queryFn: () => checkIfReportedToday(),
  });

  const { data: stockList = [], isLoading: isLoadingStock } = useQuery({
    queryKey: ["stock-list"],
    queryFn: () => getStock(),
  });

  const { data: orderData, isLoading: isLoadingOrder } = useQuery({
    queryKey: ["makan-order", orderId],
    queryFn: () => getOrderById(orderId!),
    enabled: mode === "update" && !!orderId,
  });

  const { cart, setCart, addToCart, removeFromCart, totalPrice } = useCart({
    initialCart: orderData?.cartItems,
  });

  useEffect(() => {
    const loadInitialCart = () => {
      if (mode === "update" && orderData && !initialCartLoaded) {
        setCart(orderData.cartItems.map((item) => ({ ...item })));
        setInitialCartLoaded(true);
      }
    };
    loadInitialCart();
  }, [mode, orderData, initialCartLoaded, setCart]);

  const queryClient = useQueryClient();
  const [isNavigating, setIsNavigating] = useState(false);
  const setManualChangedItems = useNotificationStore(
    (s) => s.setManualChangedItems,
  );
  const addUnseenUpdatedOrder = useNotificationStore(
    (s) => s.addUnseenUpdatedOrder,
  );

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
      if (mode === "update" && orderId) {
        return updateMakanItems(orderId, payload);
      }
      return createMakanOrder(tableId, customerType, payload);
    },
    onMutate: () => {
      loadingToastId.current = addToast("Menyimpan pesanan...", "loading");
    },
    onSettled: () => {
      if (loadingToastId.current) {
        removeToast(loadingToastId.current);
        loadingToastId.current = null;
      }
    },
    onSuccess: async (res) => {
      if (res && res.success === false) {
        addToast(res.error || "Gagal menyimpan pesanan", "error");
        return;
      }

      addToast(
        mode === "update"
          ? "Pesanan berhasil diupdate"
          : "Pesanan berhasil dibuat",
        "success",
      );

      if (mode === "update" && orderId && orderData) {
        const changedItems = cart
          .filter((newItem) => {
            const oldItem = orderData.cartItems.find(
              (i) =>
                i.stockId === newItem.stockId &&
                i.isTakeaway === newItem.isTakeaway,
            );
            return !oldItem || oldItem.quantity !== newItem.quantity;
          })
          .map((i) => `${i.name}-${i.isTakeaway}`);

        if (changedItems.length > 0) {
          setManualChangedItems(orderId, changedItems);
          addUnseenUpdatedOrder(orderId);
        }
      }

      setIsNavigating(true);
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["table-orders", tableId],
          refetchType: "all",
        }),
        queryClient.invalidateQueries({
          queryKey: ["active-antrean"],
          refetchType: "all",
        }),
        queryClient.invalidateQueries({
          queryKey: ["makan-order", orderId],
          refetchType: "all",
        }),
        queryClient.invalidateQueries({
          queryKey: ["table", tableId],
          refetchType: "all",
        }),
        queryClient.invalidateQueries({
          queryKey: ["tables-karyawan"],
          refetchType: "all",
        }),
        queryClient.invalidateQueries({
          queryKey: ["stock-list"],
          refetchType: "all",
        }),
      ]);
      router.push("/antrean");
    },
  });

  const handleSave = () => {
    if (cart.length === 0 || isPending) return;
    simpan(
      cart.map((i) => ({
        stockId: i.stockId,
        quantity: i.quantity,
        isTakeaway: i.isTakeaway,
        price: i.price,
      })),
    );
  };

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (
    !mounted ||
    isLoadingStock ||
    (mode === "update" && isLoadingOrder) ||
    !initialCartLoaded
  ) {
    return (
      <section className="h-dvh w-full md:min-h-screen dark:bg-neutral-800 flex flex-col overflow-hidden">
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
    <section className="h-dvh w-full md:min-h-screen dark:bg-neutral-800 flex flex-col overflow-hidden">
      <PageHeader
        title={
          <div className="flex">
            <div className="flex flex-col">
              <span>Meja {tableId}</span>
              <span className="text-[10px] sm:text-xs text-neutral-400 font-normal normal-case tracking-normal">
                Tipe:{" "}
                <span className="capitalize">{customerType.toLowerCase()}</span>
              </span>
            </div>
          </div>
        }
        tag={isTakeaway ? "Bungkus" : "Makan di tempat"}
        onTagClick={() => setIsTakeaway(!isTakeaway)}
      />
      <main className="relative max-w-87.5 mx-auto w-full flex-1 flex flex-col overflow-hidden pt-2">
        <div className="flex-1 overflow-y-auto grid grid-cols-2 gap-2 pb-5 content-start">
          {stockList.map((s) => {
            const currentSpecificQty =
              cart.find(
                (i) => i.stockId === s.id && i.isTakeaway === isTakeaway,
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
      </main>

      <Cart
        mode={mode}
        cart={cart}
        totalPrice={totalPrice}
        onSave={handleSave}
        onCancel={() => router.push(`/meja/${tableId}`)}
        isPending={isPending || isNavigating}
        isClosed={isClosed}
      />
    </section>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <section className="h-dvh w-full md:min-h-screen dark:bg-neutral-800 flex flex-col overflow-hidden">
          <PageHeaderSkeleton hasTag />
        </section>
      }
    >
      <MakanContent />
    </Suspense>
  );
}
