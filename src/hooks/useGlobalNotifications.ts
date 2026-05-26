import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useNotificationStore } from "@/src/store/notificationStore";
import { usePathname } from "next/navigation";

export function useGlobalNotifications() {
  const { setHasNewBungkus, setHasNewMeja } = useNotificationStore();
  const pathname = usePathname();

  const pathnameRef = useRef(pathname);
  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    const recentlyInsertedIds = new Set<number>();

    const channel = supabase
      .channel("global-notifications")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        (payload) => {
          const newRow = payload.new as {
            id?: number;
            order_type?: string;
            dining_table_id?: number;
            status?: string;
          };
          const oldRow = payload.old as {
            id?: number;
          };

          const currentPath = pathnameRef.current;
          const isInsert = payload.eventType === "INSERT";
          const isUpdate = payload.eventType === "UPDATE";
          const orderId = newRow?.id || oldRow?.id;
          const orderType = newRow?.order_type;

          const state = useNotificationStore.getState();
          const isIgnored = orderId && state.ignoredUpdateOrders.includes(orderId);

          if (isIgnored) {
            state.removeIgnoredUpdateOrder(orderId);
            return; // completely ignore this event
          }

          if (isInsert && orderId) {
            recentlyInsertedIds.add(orderId);
            setTimeout(() => recentlyInsertedIds.delete(orderId), 8000);
          }

          if (isUpdate && orderId && !recentlyInsertedIds.has(orderId)) {
            if (newRow?.status !== "selesai") {
              state.addUnseenUpdatedOrder(orderId);
            }
          }
          if (orderType === "bungkus") {
            if (currentPath !== "/bungkus") {
              setHasNewBungkus(true);
            }
          } else if (orderType === "makan") {
            const tableId = newRow.dining_table_id;

            if (tableId) {
              const isInsideThisTable = currentPath === `/meja/${tableId}`;
              if (!isInsideThisTable) {
                setHasNewMeja(true);
                state.addNewMejaId(tableId);
              }
            } else {
              if (!currentPath.startsWith("/meja/")) {
                setHasNewMeja(true);
              }
            }
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [setHasNewBungkus, setHasNewMeja]);
}
