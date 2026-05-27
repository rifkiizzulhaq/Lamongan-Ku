"use client";

import Button from "@/src/components/ui/Button";
import PaymentModal from "@/src/features/karyawan/pos/components/PaymentModal";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { update, deletes } from "@/src/server/karyawan/bungkus/bungkus.server";
import { togglePinOrder } from "@/src/server/karyawan/antrean/antrean.server";
import { LuTrash2, LuLoader, LuPin, LuPinOff } from "react-icons/lu";
import { OrderItem } from "@/interfaces/order";
import { useNotificationStore } from "@/src/store/notificationStore";
import { useUiStore } from "@/src/store/uiStore";

export interface CardBungkusProps {
  orderId: string;
  id: string;
  totalPrice: number;
  status: string;
  isPinned: boolean;
  items: OrderItem[];
}

export default function CardBungkus({
  orderId,
  id,
  totalPrice,
  status,
  isPinned,
  items,
}: CardBungkusProps) {
  const [showPayment, setShowPayment] = useState(false);
  const queryClient = useQueryClient();
  const { addToast } = useUiStore();
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
  const manualChangedItemsMap = useNotificationStore(
    (s) => s.manualChangedItems,
  );
  const manualChangedItems = manualChangedItemsMap[parsedOrderId];

  const prevItemsRef = useRef<typeof items>(items);
  const [changedItemNames, setChangedItemNames] = useState<Set<string>>(
    new Set(),
  );

  useEffect(() => {
    let nextChangedItemNames = new Set<string>();

    if (manualChangedItems && manualChangedItems.length > 0) {
      nextChangedItemNames = new Set(manualChangedItems);
    } else if (hasUnseen || isHighlighted) {
      const prev = prevItemsRef.current;
      const changed = new Set<string>();

      items.forEach((newItem) => {
        const oldItem = prev.find(
          (i) =>
            (i.n?.trim() || "") === (newItem.n?.trim() || "") &&
            String(i.isTakeaway) === String(newItem.isTakeaway),
        );

        if (!oldItem || oldItem.q !== newItem.q) {
          changed.add(`${newItem.n}-${newItem.isTakeaway}`);
        }
      });

      if (changed.size > 0) {
        nextChangedItemNames = changed;
      }
    } else {
      prevItemsRef.current = items;
    }

    setChangedItemNames((current) => {
      if (
        current.size === nextChangedItemNames.size &&
        Array.from(current).every((v) => nextChangedItemNames.has(v))
      ) {
        return current;
      }
      return nextChangedItemNames;
    });
  }, [items, isHighlighted, hasUnseen, manualChangedItems]);

  useEffect(() => {
    if (hasUnseen) {
      activateHighlight(parsedOrderId);
    }
  }, [unseenUpdatedOrders, parsedOrderId, activateHighlight, hasUnseen]);

  const invalidateAndRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["bungkus-orders"] });
    queryClient.invalidateQueries({ queryKey: ["active-antrean"] });
  };

  const optimisticRemove = () => {
    queryClient.setQueryData(["bungkus-orders"], (old: unknown) => {
      if (!old || typeof old !== "object" || !("pages" in old)) return old;

      const typedOld = old as { pages: { id: string | number }[][] };
      return {
        ...typedOld,
        pages: typedOld.pages.map((page) =>
          page.filter((order) => String(order.id) !== String(orderId)),
        ),
      };
    });

    queryClient.setQueriesData({ queryKey: ["active-antrean"] }, (old: any) => {
      if (!old || !old.pages || !Array.isArray(old.pages)) return old;

      return {
        ...old,
        pages: old.pages.map((page: any) => ({
          ...page,
          orders: page.orders.filter(
            (o: { id: string | number }) => String(o.id) !== String(orderId),
          ),
        })),
      };
    });
  };

  const { mutate: hapus, isPending: isDeleting } = useMutation({
    mutationFn: () => deletes(parseInt(orderId, 10)),
    onSuccess: (res) => {
      if (res && res.success === false) {
        addToast(res.error || "Gagal menghapus pesanan", "error");
        return;
      }
      optimisticRemove();
      invalidateAndRefresh();
    },
  });

  const { mutate: bayar, isPending: isProcessing } = useMutation({
    mutationFn: () => update(parseInt(orderId, 10), "selesai"),
    onSuccess: (res) => {
      if (res && res.success === false) {
        addToast(res.error || "Gagal menyelesaikan pesanan", "error");
        return;
      }

      addToast("Pesanan selesai & Pembayaran berhasil!", "success");

      setShowPayment(false);
      optimisticRemove();
      queryClient.invalidateQueries({ queryKey: ["bungkus-orders"] });
      queryClient.invalidateQueries({ queryKey: ["active-antrean"] });
    },
  });

  const { mutate: togglePin, isPending: isTogglingPin } = useMutation({
    mutationFn: () => togglePinOrder(parsedOrderId, !isPinned),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["bungkus-orders"] });
      const previous = queryClient.getQueryData(["bungkus-orders"]);
      
      queryClient.setQueriesData({ queryKey: ["bungkus-orders"] }, (old: any) => {
        if (!old || !old.pages) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => 
            page.map((o: any) => 
              String(o.id) === String(orderId) ? { ...o, isPinned: !isPinned } : o
            )
          )
        };
      });
      return { previous };
    },
    onError: (err, newCtx, context) => {
      if (context?.previous) {
        queryClient.setQueriesData({ queryKey: ["bungkus-orders"] }, context.previous);
      }
      addToast("Gagal menyematkan pesanan", "error");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["bungkus-orders"] });
      queryClient.invalidateQueries({ queryKey: ["active-antrean"] });
    }
  });

  return (
    <>
      <section
        className={`w-full min-h-60 rounded-xl border flex shadow-sm transition-all duration-500 cursor-default group
          ${isHighlighted
            ? "border-yellow-400 dark:border-yellow-500 ring-2 ring-yellow-400 dark:ring-yellow-500 bg-yellow-50 dark:bg-yellow-900/10"
            : "bg-white dark:bg-neutral-700 border-neutral-300 dark:border-neutral-600 hover:border-orange-500/50"
          }
        `}
      >
        <div
          className={`w-2 rounded-l-xl shrink-0 ${isPinned ? "bg-neutral-400 dark:bg-neutral-500" : (isHighlighted ? "bg-yellow-400 dark:bg-yellow-500" : "bg-orange")}`}
        ></div>
        <div className="flex-1 flex flex-col relative">
          <Link
            href={
              isDeleting || isProcessing
                ? "#"
                : `/bungkus/ordering?mode=update&orderId=${orderId}`
            }
            className={`flex-1 w-full flex flex-col justify-start px-5 py-3 ${isDeleting || isProcessing ? "pointer-events-none opacity-50" : ""}`}
            onClick={(e) => {
              if (isDeleting || isProcessing) {
                e?.preventDefault();
                return;
              }
              clearUnseenUpdatedOrder(parsedOrderId);
            }}
          >
            <div className="w-full flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h1 className={`text-lg font-bold uppercase ${isPinned ? "text-neutral-500 dark:text-neutral-400" : "text-gray-800 dark:text-white"}`}>
                  {id}
                </h1>
                {isPinned && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded-md uppercase tracking-wide border border-neutral-200 dark:border-neutral-700">
                    <LuPin size={10} /> Ditinggal
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    togglePin();
                  }}
                  disabled={isTogglingPin}
                  className={`p-1.5 rounded-full transition-colors ${isPinned ? "text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30" : "text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800"}`}
                  title={isPinned ? "Batal Sematkan (Hadir)" : "Sematkan (Ditinggal)"}
                >
                  {isTogglingPin ? <LuLoader className="animate-spin" size={18} /> : (isPinned ? <LuPin size={18} className="fill-blue-500/20" /> : <LuPinOff size={18} />)}
                </button>
                <div className="flex items-center gap-2">
                  {hasUnseen && (
                    <span className="flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-2.5 w-2.5 rounded-full bg-yellow-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-yellow-500"></span>
                    </span>
                  )}
                  <p className={`text-lg dark:font-bold ${isPinned ? "text-neutral-400 dark:text-neutral-500" : "text-neutral-600 dark:text-neutral-100"}`}>
                    Rp {totalPrice.toLocaleString("id-ID")}
                  </p>
                </div>
              </div>
            </div>
            <div className="w-full flex items-center justify-between mt-1">
              <h4 className="animate-pulse text-sm text-left font-semibold text-orange">
                {status}
              </h4>
            </div>
            <div
              className={`w-full flex flex-wrap content-start gap-2 rounded-lg p-2.5 mt-3 transition-all duration-500
                ${hasUnseen
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
                        ${isItemChanged
                        ? "bg-yellow-100 dark:bg-yellow-800/40 border border-yellow-400 dark:border-yellow-500"
                        : "bg-white dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 hover:border-orange-400/50 dark:hover:border-orange-500/50"
                      }
                      `}
                  >
                    {isItemChanged && (
                      <span className="text-[10px] font-bold text-yellow-600 dark:text-yellow-400">
                        update:
                      </span>
                    )}
                    <span
                      className={`text-xs font-medium ${isItemChanged ? "text-yellow-800 dark:text-yellow-200" : "text-neutral-700 dark:text-neutral-300"}`}
                    >
                      {item.n}
                    </span>
                    <span
                      className={`flex items-center justify-center min-w-5 h-5 font-bold rounded text-[10px]
                        ${isItemChanged
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
          <div className="flex w-full mt-auto">
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
              onClick={(e) => {
                e?.stopPropagation();
                setShowPayment(true);
              }}
              disabled={isDeleting || isProcessing}
              className="h-12 flex-1 bg-black text-white hover:bg-neutral-800 dark:bg-neutral-900 dark:hover:bg-black uppercase font-bold rounded-br-xl mt-auto z-10 relative transition-colors disabled:opacity-50"
            >
              Bayar
            </Button>
          </div>
        </div>
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
