"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { assignTableToOrder } from "@/src/server/karyawan/antrean/antrean.server";
import { LuLoader } from "react-icons/lu";
import { useUiStore } from "@/src/store/uiStore";
import { useNotificationStore } from "@/src/store/notificationStore";

import { Order, DiningTable } from "@/db/schema";

export interface AntreanOrderProps {
  order: Order & {
    diningTable: DiningTable | null;
    items: { quantity: number; isTakeaway: string; stock: { name: string } }[];
  };
  tables: DiningTable[];
}

export default function CardAntrean({ order, tables }: AntreanOrderProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { addToast } = useUiStore();
  const [selectedTable, setSelectedTable] = useState<number | "">("");

  const highlightedOrders = useNotificationStore((s) => s.highlightedOrders);
  const unseenUpdatedOrders = useNotificationStore((s) => s.unseenUpdatedOrders);
  const activateHighlight = useNotificationStore((s) => s.activateHighlight);
  const manualChangedItemsMap = useNotificationStore((s) => s.manualChangedItems);

  const parsedOrderId = parseInt(order.id.toString(), 10);
  const isHighlighted = highlightedOrders.includes(parsedOrderId);
  const hasUnseen = unseenUpdatedOrders.includes(parsedOrderId);
  const manualChangedItems = manualChangedItemsMap[parsedOrderId];

  const prevItemsRef = useRef<typeof order.items>(order.items);
  const [changedItemNames, setChangedItemNames] = useState<Set<string>>(new Set());

  useEffect(() => {
    let nextChangedItemNames = new Set<string>();

    if (manualChangedItems && manualChangedItems.length > 0) {
      nextChangedItemNames = new Set(manualChangedItems);
    } else if (hasUnseen || isHighlighted) {
      const prev = prevItemsRef.current;
      const changed = new Set<string>();

      order.items.forEach((newItem) => {
        const oldItem = prev.find(
          (i: any) =>
            (i.stock?.name?.trim() || "") === (newItem.stock?.name?.trim() || "") &&
            String(i.isTakeaway) === String(newItem.isTakeaway)
        );

        if (!oldItem || oldItem.quantity !== newItem.quantity) {
          changed.add(`${newItem.stock?.name}-${newItem.isTakeaway}`);
        }
      });

      if (changed.size > 0) {
        nextChangedItemNames = changed;
      }
    } else {
      prevItemsRef.current = order.items;
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
  }, [order.items, isHighlighted, hasUnseen, manualChangedItems]);

  useEffect(() => {
    if (hasUnseen) {
      activateHighlight(parsedOrderId);
    }
  }, [unseenUpdatedOrders, parsedOrderId, activateHighlight, hasUnseen]);

  const isBungkus = order.orderType.toLowerCase() === "bungkus";
  const hasTakeaway = !isBungkus && order.items.some((item) => item.isTakeaway === "true");
  const label = isBungkus
    ? "BUNGKUS"
    : order.diningTable?.name
      ? order.diningTable.name
      : "PILIH MEJA";

  const orderIdStr = isBungkus ? `B-${order.id}` : `M-${order.id}`;

  const { mutate: assignTable, isPending: isAssigning } = useMutation({
    mutationFn: (tableId: number) => {
      useNotificationStore.getState().ignoreNextUpdateForOrder(order.id);
      return assignTableToOrder(order.id, tableId);
    },
    onSuccess: (res) => {
      if (!res.success) {
        addToast(res.error || "Gagal", "error");
        return;
      }
      addToast("Meja berhasil dipilih", "success");
      queryClient.invalidateQueries({ queryKey: ["active-antrean"] });
      queryClient.invalidateQueries({ queryKey: ["tables-with-orders"] });
      queryClient.invalidateQueries({ queryKey: ["all-tables-antrean"] });
      queryClient.invalidateQueries({ queryKey: ["tables-karyawan"] });
    },
  });

  const handleTableSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const tableId = parseInt(e.target.value, 10);
    if (tableId) {
      assignTable(tableId);
    }
  };

  const getHref = () => {
    if (isBungkus) return `/bungkus`;
    if (order.diningTableId) return `/meja/${order.diningTableId}`;
    return "#";
  };

  return (
    <section
      className={`w-full shrink-0 min-h-40 relative rounded-xl border flex shadow-sm transition-all duration-500 
        ${isHighlighted ? "bg-yellow-50 dark:bg-yellow-900/30 border-yellow-400 dark:border-yellow-500 scale-[1.02] z-10" : "bg-white dark:bg-neutral-700 border-neutral-300 dark:border-neutral-600 hover:border-orange-500/50"}`}
    >
      <div
        className={`w-2 rounded-l-xl shrink-0 ${isBungkus ? "bg-orange" : "bg-blue-500"}`}
      ></div>
      <div className="flex-1 flex flex-col relative">
        <div
          className="flex-1 flex flex-col justify-start px-5 py-3 cursor-pointer"
          onClick={() => {
            router.push(getHref());
          }}
        >
          <div className="w-full flex items-center justify-between">
            <h1 className="text-lg font-bold text-gray-800 dark:text-white uppercase">
              {orderIdStr}
            </h1>
            <p
              className="text-lg text-neutral-600 dark:text-neutral-100 dark:font-bold"
            >
              Rp {order.totalPrice.toLocaleString("id-ID")}
            </p>
          </div>

          <div className="w-full flex items-center justify-between mt-1.5 relative z-20">
            <div className="relative">
              {!isBungkus ? (
                <div className="flex flex-col gap-1.5 items-start">
                  <div
                    className="flex items-center gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <select
                      className="text-sm font-semibold border-b-2 border-blue-500 bg-transparent text-blue-500 outline-none focus:ring-0 px-1 py-0.5 cursor-pointer"
                      value={selectedTable || order.diningTableId || ""}
                      onChange={(e) => {
                        handleTableSelect(e);
                        setSelectedTable(parseInt(e.target.value, 10));
                      }}
                      disabled={isAssigning}
                    >
                      <option value="" disabled>
                        Pilih Meja...
                      </option>
                      {tables.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                    {isAssigning && (
                      <LuLoader className="animate-spin text-blue-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {order.customerType && (
                      <span className="bg-blue-500 text-white px-2 py-0.5 rounded-full text-[10px] font-bold capitalize">
                        Tipe: {order.customerType}
                      </span>
                    )}
                    {hasTakeaway && (
                      <div className="flex items-center justify-center bg-hijau text-hijau-700 dark:bg-hijau-500/30 dark:text-hijau-300 px-2 py-0.5 rounded-full">
                        <span className="text-[10px] text-left font-bold text-white">
                          Bungkus
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <h4 className="text-sm text-left font-semibold text-orange">
                  {label}
                </h4>
              )}
            </div>
            <span
              className="text-xs text-neutral-500 italic"
            >
              {new Date(order.createdAt).toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>

          <div
            className={`w-full flex flex-wrap content-start gap-2 rounded-lg p-2.5 mt-3 transition-colors duration-500
              ${isHighlighted
                ? "bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-600"
                : "bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-200/60 dark:border-neutral-800"
              }`}
          >
            {hasUnseen && !isHighlighted && (
              <div className="w-full flex items-center gap-1 mb-1">
                <span className="text-[10px] font-bold text-yellow-600 dark:text-yellow-400 uppercase tracking-wide">
                  ⚡ Pesanan diperbarui
                </span>
              </div>
            )}

            {[...order.items]
              .sort((a, b) => (a.isTakeaway === "true" ? 1 : 0) - (b.isTakeaway === "true" ? 1 : 0))
              .map((item, i: number) => {
              const isItemChanged = isHighlighted && changedItemNames.has(`${item.stock?.name}-${item.isTakeaway}`);

              return (
                <div
                  key={i}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md shadow-sm transition-all duration-500
                    ${isItemChanged
                      ? "bg-yellow-100 dark:bg-yellow-800/40 border border-yellow-400 dark:border-yellow-500"
                      : "bg-white dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 hover:border-orange-400/50 dark:hover:border-orange-500/50"
                    }`}
                >
                  {isItemChanged ? (
                    <span className="text-[10px] font-bold text-yellow-600 dark:text-yellow-400">
                      update:
                    </span>
                  ) : !isBungkus && item.isTakeaway === "true" ? (
                    <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400">
                      bungkus:
                    </span>
                  ) : null}
                  <span className={`text-xs font-medium ${isItemChanged ? "text-yellow-800 dark:text-yellow-200" : "text-neutral-700 dark:text-neutral-300"}`}>
                    {item.stock?.name}
                  </span>
                  <span className={`flex items-center justify-center min-w-5 h-5 font-bold rounded text-[10px]
                    ${isItemChanged
                      ? "bg-yellow-300 text-yellow-900 dark:bg-yellow-600 dark:text-yellow-100"
                      : "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400"
                    }`}
                  >
                    {item.quantity}x
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
