import { useState, useCallback } from "react";
import type { CartItem } from "@/interfaces/order";
import type { Stock } from "@/db/schema";

interface UseCartProps {
  initialCart?: CartItem[];
}

export function useCart({ initialCart = [] }: UseCartProps = {}) {
  const [cart, setCart] = useState<CartItem[]>(initialCart);

  const addToCart = useCallback((s: Stock, isTakeaway?: boolean) => {
    setCart((prev) => {
      const existing = prev.find(
        (i) => i.stockId === s.id && i.isTakeaway === isTakeaway,
      );

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
  }, []);

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

    addToCart,
    removeFromCart,
    totalPrice,
  };
}
