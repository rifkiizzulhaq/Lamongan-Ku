"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
  getActiveAntrean,
  getAllTables,
} from "@/src/server/karyawan/antrean/antrean.server";
import { useSupabaseRealtime } from "@/src/hooks/useSupabaseRealtime";
import { useRef, useEffect, useState } from "react";
import CardAntrean from "./CardAntrean";
import CardBungkusSkeleton from "../../bungkus/components/CardBungkusSkeleton";
import { LuLoader } from "react-icons/lu";

export default function AntreanClient() {
  useSupabaseRealtime("orders", [
    "active-antrean",
    "bungkus-orders",
    "tables-with-orders",
  ]);

  const { data: tablesData } = useQuery({
    queryKey: ["all-tables-antrean"],
    queryFn: () => getAllTables(),
    staleTime: Infinity,
  });

  const [prioritizeNonLele, setPrioritizeNonLele] = useState(false);

  const {
    data: infiniteData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ["active-antrean", prioritizeNonLele],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await getActiveAntrean(pageParam, 5, prioritizeNonLele);
      return res;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.hasNextPage) return allPages.length + 1;
      return undefined;
    },
  });

  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 1.0 },
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const orders = infiniteData?.pages.flatMap((page) => page.orders) || [];
  const tables = tablesData || [];

  const showSkeleton = isLoading && orders.length === 0;

  return (
    <>
      <div className="flex items-center justify-end pb-3 px-1">
        <label className="flex items-center gap-3 cursor-pointer group select-none">
          <span className="text-[13px] font-bold text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-800 dark:group-hover:text-white transition-colors">
            Dahulukan Tanpa Lele
          </span>
          <div className="relative flex items-center">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              checked={prioritizeNonLele}
              onChange={(e) => setPrioritizeNonLele(e.target.checked)}
            />
            <div className="w-10 h-5 bg-neutral-300 rounded-full peer dark:bg-neutral-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-orange transition-colors"></div>
          </div>
        </label>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col gap-4 pb-30 scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-700">
        {showSkeleton ? (
          <CardBungkusSkeleton count={5} />
        ) : orders.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center -mt-20">
            <p className="text-gray-500 font-medium">
              Belum ada antrean pesanan.
            </p>
          </div>
        ) : (
          orders.map((order) => (
            <CardAntrean key={order.id} order={order} tables={tables} />
          ))
        )}

        {hasNextPage && orders.length > 0 && (
          <div
            ref={observerTarget}
            className="w-full py-4 flex justify-center items-center"
          >
            <LuLoader className="animate-spin text-orange text-2xl" />
          </div>
        )}
      </div>
    </>
  );
}
