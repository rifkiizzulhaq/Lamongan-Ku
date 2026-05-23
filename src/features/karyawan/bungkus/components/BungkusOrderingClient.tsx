"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import CardOrdering from "@/src/features/karyawan/pos/components/CardOrdering";
import Cart from "@/src/features/karyawan/pos/components/Cart";
import { CartItem } from "@/interfaces/order";
import {
  create,
  updateItems,
} from "@/src/server/karyawan/bungkus/bungkus.server";
import { checkIfReportedToday } from "@/src/server/karyawan/more/more.server";
import type { Stock } from "@/db/schema";
import { useUiStore } from "@/src/store/uiStore";
import { useNotificationStore } from "@/src/store/notificationStore";
import { useCart } from "@/src/hooks/useCart";

interface Props {
  stockList: Stock[];
  mode?: "create" | "update";
  orderId?: number;
  initialCart?: CartItem[];
}

export default function BungkusOrderingClient({
  stockList,
  mode = "create",
  orderId,
  initialCart = [],
}: Props) {
  const { addToast, removeToast } = useUiStore();
  const {
    cart,
    isSpecialMenu,
    hasMainStockAvailable,
    addToCart,
    removeFromCart,
    totalPrice,
  } = useCart({ stockList, initialCart, mode });
  const router = useRouter();
  const queryClient = useQueryClient();
  const setManualChangedItems = useNotificationStore(
    (s) => s.setManualChangedItems,
  );
  const addUnseenUpdatedOrder = useNotificationStore(
    (s) => s.addUnseenUpdatedOrder,
  );

  const { data: isClosed = false } = useQuery({
    queryKey: ["check-reported-today", new Date().toDateString()],
    queryFn: () => checkIfReportedToday(),
  });

  const [isNavigating, setIsNavigating] = useState(false);

  const loadingToastId = useRef<string | null>(null);

  const { mutate: simpan, isPending } = useMutation({
    mutationFn: async (payload: { stockId: number; quantity: number }[]) => {
      if (mode === "update" && orderId) {
        return updateItems(orderId, payload);
      }
      return create(payload);
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
      
      addToast(mode === "update" ? "Pesanan berhasil diupdate" : "Pesanan berhasil dibuat", "success");

      if (mode === "update" && orderId) {
        const changedItems = cart
          .filter((newItem) => {
            const oldItem = initialCart.find(
              (i) => i.stockId === newItem.stockId,
            );
            return !oldItem || oldItem.quantity !== newItem.quantity;
          })
          .map((i) => `${i.name}-undefined`);

        if (changedItems.length > 0) {
          setManualChangedItems(orderId, changedItems);
          addUnseenUpdatedOrder(orderId);
        }
      }

      setIsNavigating(true);
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["bungkus-orders"],
          refetchType: "all",
        }),
        queryClient.invalidateQueries({
          queryKey: ["bungkus-order", orderId],
          refetchType: "all",
        }),
        queryClient.invalidateQueries({
          queryKey: ["stock-list"],
          refetchType: "all",
        }),
      ]);
      router.push("/bungkus");
    },
  });

  const handleSave = () => {
    if (cart.length === 0 || isPending) return;
    simpan(cart.map((i) => ({ stockId: i.stockId, quantity: i.quantity })));
  };

  return (
    <>
      <main className="relative max-w-87.5 mx-auto w-full flex-1 flex flex-col overflow-hidden pt-2">
        <div className="flex-1 overflow-y-auto grid grid-cols-2 gap-2 pb-5 content-start">
          {stockList.map((s) =>
            (() => {
              const currentQty =
                cart.find((i) => i.stockId === s.id)?.quantity ?? 0;
              const initialLockedQty =
                initialCart.find((i) => i.stockId === s.id)?.quantity ?? 0;
              const available =
                (s.quantity ?? 0) + (mode === "update" ? initialLockedQty : 0);
              const special = isSpecialMenu(s.id);
              const canAdd = special
                ? hasMainStockAvailable
                : currentQty < available;

              return (
                <CardOrdering
                  key={s.id}
                  name={s.name}
                  price={s.price}
                  quantity={currentQty}
                  sisa={special ? undefined : available - currentQty}
                  disabled={!canAdd || isPending || isNavigating}
                  onAdd={() => {
                    if (isPending || isNavigating) return;
                    addToCart(s);
                  }}
                  onRemove={() => {
                    if (isPending || isNavigating) return;
                    removeFromCart(s.id);
                  }}
                />
              );
            })(),
          )}
        </div>
      </main>

      <Cart
        mode={mode}
        cart={cart}
        totalPrice={totalPrice}
        onSave={handleSave}
        onCancel={() => router.push("/bungkus")}
        isPending={isPending || isNavigating}
        isClosed={isClosed}
      />
    </>
  );
}
