"use client";

import Button from "@/src/components/ui/Button";
import PaymentModal from "@/src/features/karyawan/pos/components/PaymentModal";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { update, deletes } from "@/src/server/karyawan/bungkus/bungkus.server";
import { LuTrash2, LuLoader } from "react-icons/lu";
import { OrderItem } from "@/interfaces/order";
import { useNotificationStore } from "@/src/store/notificationStore";

export interface CardBungkusProps {
  orderId: string;
  id: string;
  totalPrice: number;
  status: string;
  items: OrderItem[];
}

export default function CardBungkus({
  orderId,
  id,
  totalPrice,
  status,
  items,
}: CardBungkusProps) {
  const [showPayment, setShowPayment] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();
  const highlightedOrders = useNotificationStore((s) => s.highlightedOrders);
  const unseenUpdatedOrders = useNotificationStore(
    (s) => s.unseenUpdatedOrders,
  );
  const activateHighlight = useNotificationStore((s) => s.activateHighlight);

  const parsedOrderId = parseInt(orderId, 10);
  const isHighlighted = highlightedOrders.includes(parsedOrderId);
  const hasUnseen = unseenUpdatedOrders.includes(parsedOrderId);
  const clearUnseenUpdatedOrder = useNotificationStore(
    (s) => s.clearUnseenUpdatedOrder,
  );

  const prevItemsRef = useRef<typeof items>(items);
  const [changedItemNames, setChangedItemNames] = useState<Set<string>>(
    new Set(),
  );

  useEffect(() => {
    if (hasUnseen || isHighlighted) {
      const prev = prevItemsRef.current;
      const changed = new Set<string>();

      items.forEach((newItem) => {
        const oldItem = prev.find(
          (i) =>
            (i.n?.trim() || "") === (newItem.n?.trim() || "") &&
            i.isTakeaway === newItem.isTakeaway,
        );

        if (!oldItem || oldItem.q !== newItem.q) {
          changed.add(`${newItem.n}-${newItem.isTakeaway}`);
        }
      });

      if (changed.size > 0) {
        setChangedItemNames(changed);
      }
      return;
    }

    prevItemsRef.current = items;
    setChangedItemNames(new Set());
  }, [items, isHighlighted, hasUnseen]);

  useEffect(() => {
    if (hasUnseen) {
      activateHighlight(parsedOrderId);
    }
  }, [unseenUpdatedOrders, parsedOrderId, activateHighlight, hasUnseen]);

  const invalidateAndRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["bungkus"] });
    router.refresh();
  };

  const { mutate: hapus, isPending: isDeleting } = useMutation({
    mutationFn: () => deletes(parseInt(orderId, 10)),
    onSuccess: invalidateAndRefresh,
  });

  const { mutate: bayar, isPending: isProcessing } = useMutation({
    mutationFn: () => update(parseInt(orderId, 10), "selesai"),
    onSuccess: () => {
      setShowPayment(false);
      invalidateAndRefresh();
    },
  });

  return (
    <>
      <section
        className={`w-full h-60 rounded-xl border flex items-stretch shadow-sm transition-all duration-500 cursor-default group
          ${
            isHighlighted
              ? "border-yellow-400 dark:border-yellow-500 ring-2 ring-yellow-400 dark:ring-yellow-500 bg-yellow-50 dark:bg-yellow-900/10"
              : "bg-white dark:bg-neutral-700 border-neutral-300 dark:border-neutral-600 hover:border-orange-500/50"
          }
        `}
      >
        <main className="w-full h-full flex items-center justify-between">
          <div
            className={`w-2 h-full rounded-l-xl shrink-0 ${isHighlighted ? "bg-yellow-400 dark:bg-yellow-500" : "bg-orange"}`}
          ></div>
          <div className="w-full h-full flex flex-col justify-between">
            <Link
              href={`/bungkus/ordering?mode=update&orderId=${orderId}`}
              className="flex flex-col items-center justify-between px-5 py-3"
              onClick={() => clearUnseenUpdatedOrder(parsedOrderId)}
            >
              <div className="w-full flex items-center justify-between">
                <h1 className="text-lg font-bold text-gray-800 dark:text-white uppercase">
                  {id}
                </h1>
                <div className="flex items-center gap-2">
                  {hasUnseen && (
                    <span className="flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-2.5 w-2.5 rounded-full bg-yellow-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-yellow-500"></span>
                    </span>
                  )}
                  <p className="text-lg text-neutral-600 dark:text-neutral-100 dark:font-bold">
                    Rp {totalPrice.toLocaleString("id-ID")}
                  </p>
                </div>
              </div>
              <div className="w-full flex items-center justify-between mt-1">
                <h4 className="animate-pulse text-sm text-left font-semibold text-orange">
                  {status}
                </h4>
              </div>
              <div
                className={`w-full flex flex-wrap content-start gap-2 rounded-lg p-2.5 mt-3 overflow-y-auto max-h-24 scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-700 transition-all duration-500
                ${
                  hasUnseen
                    ? "bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-600"
                    : "bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-200/60 dark:border-neutral-800"
                }
              `}
              >
                {hasUnseen && !isHighlighted && (
                  <div className="w-full flex items-center gap-1 mb-1">
                    <span className="text-[10px] font-bold text-yellow-600 dark:text-yellow-400 uppercase tracking-wide">
                      ⚡ Pesanan diperbarui
                    </span>
                  </div>
                )}
                {items.map((item, i) => {
                  const isItemChanged =
                    isHighlighted &&
                    changedItemNames.has(`${item.n}-${item.isTakeaway}`);
                  return (
                    <div
                      key={i}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md shadow-sm transition-all duration-500 cursor-default
                        ${
                          isItemChanged
                            ? "bg-yellow-100 dark:bg-yellow-800/40 border border-yellow-400 dark:border-yellow-500"
                            : "bg-white dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 hover:border-orange-400/50 dark:hover:border-orange-500/50"
                        }
                      `}
                    >
                      {isItemChanged && (
                        <span className="text-[10px] font-bold text-yellow-600 dark:text-yellow-400">
                          {item.isTakeaway ? "bungkus:" : "update:"}
                        </span>
                      )}
                      <span
                        className={`text-xs font-medium ${isItemChanged ? "text-yellow-800 dark:text-yellow-200" : "text-neutral-700 dark:text-neutral-300"}`}
                      >
                        {item.n}
                      </span>
                      <span
                        className={`flex items-center justify-center min-w-5 h-5 font-bold rounded text-[10px]
                        ${
                          isItemChanged
                            ? "bg-yellow-300 text-yellow-900 dark:bg-yellow-600 dark:text-yellow-100"
                            : "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400"
                        }
                      `}
                      >
                        {item.q}x
                      </span>
                    </div>
                  );
                })}
              </div>
            </Link>
            <div className="flex">
              <Button
                onClick={() => hapus()}
                disabled={isDeleting}
                className="h-12 w-16 shrink-0 bg-red-500 text-white hover:bg-red-600 dark:bg-red-900 dark:hover:bg-red-700 uppercase font-bold rounded-none text-xs transition-colors mt-auto z-10 relative flex items-center justify-center disabled:opacity-50"
              >
                {isDeleting ? (
                  <LuLoader className="animate-spin" />
                ) : (
                  <LuTrash2 size={18} strokeWidth={2.5} />
                )}
              </Button>
              <Button
                onClick={() => setShowPayment(true)}
                className="h-12 flex-1 bg-black text-white hover:bg-neutral-800 dark:bg-neutral-900 dark:hover:bg-black uppercase font-bold rounded-br-xl mt-auto z-10 relative transition-colors"
              >
                Bayar
              </Button>
            </div>
          </div>
        </main>
      </section>

      {showPayment && (
        <PaymentModal
          id={id}
          totalPrice={totalPrice}
          loading={isProcessing}
          onClose={() => setShowPayment(false)}
          onConfirm={() => bayar()}
        />
      )}
    </>
  );
}
