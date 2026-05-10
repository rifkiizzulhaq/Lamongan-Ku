"use client";

import { useState, use, Suspense } from "react";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import CardOrdering from "@/src/features/karyawan/pos/components/CardOrdering";
import Cart from "@/src/features/karyawan/pos/components/Cart";
import PageHeader from "@/src/components/ui/PageHeader";
import { getStock } from "@/src/server/karyawan/bungkus/bungkus.server";
import { getOrderById, createMakanOrder, updateMakanItems } from "@/src/server/karyawan/meja/meja.server";
import { CartItem } from "@/interfaces/models";
import type { Stock } from "@/db/schema";
import PageHeaderSkeleton from "@/src/components/ui/PageHeaderSkeleton";
import CardOrderingSkeleton from "@/src/features/karyawan/pos/components/CardOrderingSkeleton";

function MakanContent() {
  const router = useRouter();
  const params = useParams();
  const tableIdStr = Array.isArray(params?.tableId) ? params.tableId[0] : params?.tableId;
  const tableId = tableIdStr ? parseInt(tableIdStr, 10) : 0;
  
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") === "update" ? "update" : "create";
  const orderIdStr = searchParams.get("orderId");
  const orderId = orderIdStr ? parseInt(orderIdStr, 10) : undefined;
  const customerType = searchParams.get("tipe") || "Sendiri";

  const [isTakeaway, setIsTakeaway] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [initialCartLoaded, setInitialCartLoaded] = useState(false);

  const { data: stockList = [], isLoading: isLoadingStock } = useQuery({
    queryKey: ["stock-list"],
    queryFn: () => getStock(),
  });

  const { data: orderData, isLoading: isLoadingOrder } = useQuery({
    queryKey: ["makan-order", orderId],
    queryFn: () => getOrderById(orderId!),
    enabled: mode === "update" && !!orderId,
  });

  if (mode === "update" && orderData && !initialCartLoaded) {
    setCart(orderData.cartItems.map((item) => ({ ...item })));
    setInitialCartLoaded(true);
  } else if (mode === "create" && !initialCartLoaded) {
    setInitialCartLoaded(true);
  }

  const queryClient = useQueryClient();

  const { mutate: simpan, isPending } = useMutation({
    mutationFn: async (payload: { stockId: number; quantity: number; isTakeaway?: boolean }[]) => {
      if (mode === "update" && orderId) {
        return updateMakanItems(orderId, payload);
      }
      return createMakanOrder(tableId, customerType, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["table-orders", tableId] });
      queryClient.invalidateQueries({ queryKey: ["table", tableId] });
      queryClient.invalidateQueries({ queryKey: ["tables-karyawan"] });
      queryClient.invalidateQueries({ queryKey: ["stock-list"] });
      router.push(`/meja/${tableId}`);
    },
  });

  const specialZeroStockItems = ["nasi", "teh manis", "sambal"];
  const isSpecialMenu = (name: string) => specialZeroStockItems.includes(name.trim().toLowerCase());

  const addToCart = (s: Stock) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.stockId === s.id && i.isTakeaway === isTakeaway);
      
      const currentTotalQtyForStock = prev.filter(i => i.stockId === s.id).reduce((sum, item) => sum + item.quantity, 0);
      const initialLockedQty = mode === "update" && orderData
        ? (orderData.cartItems.filter((i) => i.stockId === s.id).reduce((sum, item) => sum + item.quantity, 0))
        : 0;
        
      const available = (s.quantity ?? 0) + initialLockedQty;
      const special = isSpecialMenu(s.name);

      if (!special && currentTotalQtyForStock >= available) return prev;

      if (existing) {
        return prev.map((i) =>
          i.stockId === s.id && i.isTakeaway === isTakeaway ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...prev,
        { stockId: s.id, name: s.name, price: s.price, quantity: 1, isTakeaway },
      ];
    });
  };

  const removeFromCart = (stockId: number) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.stockId === stockId && i.isTakeaway === isTakeaway);
      if (existing && existing.quantity > 1) {
        return prev.map((i) =>
          i.stockId === stockId && i.isTakeaway === isTakeaway ? { ...i, quantity: i.quantity - 1 } : i
        );
      }
      return prev.filter((i) => !(i.stockId === stockId && i.isTakeaway === isTakeaway));
    });
  };

  const totalPrice = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const handleSave = () => {
    if (cart.length === 0 || isPending) return;
    simpan(cart.map((i) => ({ stockId: i.stockId, quantity: i.quantity, isTakeaway: i.isTakeaway })));
  };

  if (isLoadingStock || (mode === "update" && isLoadingOrder) || !initialCartLoaded) {
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
        title={`Meja ${tableId}`}
        tag={isTakeaway ? "Bungkus" : "Makan di tempat"}
        onTagClick={() => setIsTakeaway(!isTakeaway)}
      />
      <main className="relative max-w-87.5 mx-auto w-full flex-1 flex flex-col overflow-hidden pt-2">
        <div className="flex-1 overflow-y-auto grid grid-cols-2 gap-2 pb-5 content-start">
          {stockList.map((s) => {
            const currentTotalQtyForStock = cart.filter(i => i.stockId === s.id).reduce((sum, item) => sum + item.quantity, 0);
            const initialLockedQty = mode === "update" && orderData
              ? (orderData.cartItems.filter((i) => i.stockId === s.id).reduce((sum, item) => sum + item.quantity, 0))
              : 0;
            const available = (s.quantity ?? 0) + initialLockedQty;
            const special = isSpecialMenu(s.name);
            const canAdd = special || currentTotalQtyForStock < available;
            
            const currentSpecificQty = cart.find(i => i.stockId === s.id && i.isTakeaway === isTakeaway)?.quantity ?? 0;

            return (
              <CardOrdering
                key={s.id}
                name={s.name}
                price={s.price}
                quantity={currentSpecificQty}
                sisa={special ? undefined : available - currentTotalQtyForStock}
                disabled={!canAdd}
                onAdd={() => addToCart(s)}
                onRemove={() => removeFromCart(s.id)}
              />
            );
          })}
        </div>
      </main>

      {/* Detail kecil untuk item bungkus */}
      {cart.some((item) => item.isTakeaway) && (
        <div className="px-4 py-2 bg-neutral-100 dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800">
          <p className="text-xs font-bold text-neutral-500 mb-1">DETAIL BUNGKUS:</p>
          <div className="flex flex-wrap gap-2">
            {cart
              .filter((item) => item.isTakeaway)
              .map((item, idx) => (
                <span
                  key={idx}
                  className="bg-neutral-800 text-white text-[10px] font-bold px-2 py-1 rounded"
                >
                  Bungkus: {item.name} {item.quantity}x
                </span>
              ))}
          </div>
        </div>
      )}

      <Cart mode={mode} cart={cart} totalPrice={totalPrice} onSave={handleSave} isPending={isPending} />
    </section>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<section className="h-[calc(100dvh-45px)] w-full md:min-h-screen dark:bg-neutral-800 flex flex-col overflow-hidden"><PageHeaderSkeleton hasTag /></section>}>
      <MakanContent />
    </Suspense>
  );
}
