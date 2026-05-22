"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
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
  const { addToast } = useUiStore();
  const [cart, setCart] = useState<CartItem[]>(initialCart);
  const router = useRouter();

  const { data: isClosed = false } = useQuery({
    queryKey: ["check-reported-today", new Date().toDateString()],
    queryFn: () => checkIfReportedToday(),
  });

  const specialZeroStockItems = ["nasi", "teh manis", "sambal"];
  const isSpecialMenu = (name: string) =>
    specialZeroStockItems.includes(name.trim().toLowerCase());

  const hasMainStockAvailable = stockList.some((s) => {
    if (isSpecialMenu(s.name)) return false;
    const initialLockedQty =
      mode === "update"
        ? (initialCart.find((i) => i.stockId === s.id)?.quantity ?? 0)
        : 0;
    return (s.quantity ?? 0) + initialLockedQty > 0;
  });

  const [isNavigating, setIsNavigating] = useState(false);

  const { mutate: simpan, isPending } = useMutation({
    mutationFn: async (payload: { stockId: number; quantity: number }[]) => {
      if (mode === "update" && orderId) {
        return updateItems(orderId, payload);
      }
      return create(payload);
    },
    onSuccess: (res) => {
      if (res && res.success === false) {
        addToast(res.error || "Gagal menyimpan pesanan", "error");
        return;
      }
      setIsNavigating(true);
      router.push("/bungkus");
    },
  });

  const addToCart = (s: Stock) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.stockId === s.id);
      const currentQty = existing ? existing.quantity : 0;
      const initialLockedQty =
        mode === "update"
          ? (initialCart.find((i) => i.stockId === s.id)?.quantity ?? 0)
          : 0;
      const available = (s.quantity ?? 0) + initialLockedQty;
      const special = isSpecialMenu(s.name);

      if (special) {
        if (!hasMainStockAvailable) return prev;
      } else {
        if (currentQty >= available) return prev;
      }

      if (existing)
        return prev.map((i) =>
          i.stockId === s.id ? { ...i, quantity: i.quantity + 1 } : i,
        );
      return [
        ...prev,
        { stockId: s.id, name: s.name, price: s.price, quantity: 1 },
      ];
    });
  };

  const removeFromCart = (stockId: number) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.stockId === stockId);
      if (existing && existing.quantity > 1)
        return prev.map((i) =>
          i.stockId === stockId ? { ...i, quantity: i.quantity - 1 } : i,
        );
      return prev.filter((i) => i.stockId !== stockId);
    });
  };

  const totalPrice = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

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
              const special = isSpecialMenu(s.name);
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
                  disabled={!canAdd}
                  onAdd={() => addToCart(s)}
                  onRemove={() => removeFromCart(s.id)}
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
        isPending={isPending || isNavigating}
        isClosed={isClosed}
      />
    </>
  );
}
