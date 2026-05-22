import { useState, useCallback } from "react";
import type { CartItem } from "@/interfaces/order";
import type { Stock } from "@/db/schema";

interface UseCartProps {
  stockList: Stock[];
  initialCart?: CartItem[];
  mode?: "create" | "update";
}

export function useCart({
  stockList,
  initialCart = [],
  mode = "create",
}: UseCartProps) {
  const [cart, setCart] = useState<CartItem[]>(initialCart);

  const isSpecialMenu = useCallback(
    (stockId: number) => {
      const item = stockList.find((s) => s.id === stockId);
      return item?.isUnlimited === 1;
    },
    [stockList],
  );

  const hasMainStockAvailable = stockList?.some((s) => {
    if (isSpecialMenu(s.id)) return false;
    const initialLockedQty =
      mode === "update"
        ? initialCart
            .filter((i) => i.stockId === s.id)
            .reduce((sum, item) => sum + item.quantity, 0)
        : 0;
    return (s.quantity ?? 0) + initialLockedQty > 0;
  });

  const addToCart = useCallback(
    (s: Stock, isTakeaway?: boolean) => {
      setCart((prev) => {
        const existing = prev.find(
          (i) => i.stockId === s.id && i.isTakeaway === isTakeaway,
        );

        const currentTotalQtyForStock = prev
          .filter((i) => i.stockId === s.id)
          .reduce((sum, item) => sum + item.quantity, 0);

        const initialLockedQty =
          mode === "update"
            ? initialCart
                .filter((i) => i.stockId === s.id)
                .reduce((sum, item) => sum + item.quantity, 0)
            : 0;

        const available = (s.quantity ?? 0) + initialLockedQty;
        const special = isSpecialMenu(s.id);

        if (special) {
          if (!hasMainStockAvailable) return prev;
        } else {
          if (currentTotalQtyForStock >= available) return prev;
        }

        if (existing) {
          return prev.map((i) =>
            i.stockId === s.id && i.isTakeaway === isTakeaway
              ? { ...i, quantity: i.quantity + 1 }
              : i,
          );
        }
        return [
          ...prev,
          {
            stockId: s.id,
            name: s.name,
            price: s.price,
            quantity: 1,
            isTakeaway,
          },
        ];
      });
    },
    [mode, initialCart, hasMainStockAvailable, isSpecialMenu],
  );

  const removeFromCart = useCallback(
    (stockId: number, isTakeaway?: boolean) => {
      setCart((prev) => {
        const existing = prev.find(
          (i) => i.stockId === stockId && i.isTakeaway === isTakeaway,
        );
        if (existing && existing.quantity > 1) {
          return prev.map((i) =>
            i.stockId === stockId && i.isTakeaway === isTakeaway
              ? { ...i, quantity: i.quantity - 1 }
              : i,
          );
        }
        return prev.filter(
          (i) => !(i.stockId === stockId && i.isTakeaway === isTakeaway),
        );
      });
    },
    [],
  );

  const totalPrice = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return {
    cart,
    setCart,
    isSpecialMenu,
    hasMainStockAvailable,
    addToCart,
    removeFromCart,
    totalPrice,
  };
}
