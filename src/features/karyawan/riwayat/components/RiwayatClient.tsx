"use client";

import { useRef, useEffect, useState, useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import CardRiwayat from "./CardRiwayat";
import { getHistory } from "@/src/server/karyawan/riwayat/riwayat.server";
import { LuLoader } from "react-icons/lu";
import CardRiwayatSkeleton from "./CardRiwayatSkeleton";
import { useUiStore } from "@/src/store/uiStore";
import { useSupabaseRealtime } from "@/src/hooks/useSupabaseRealtime";

export default function RiwayatClient() {
  useSupabaseRealtime("orders", ["riwayat-orders"]);
  const { addToast } = useUiStore();
  const {
    data: infiniteData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending,
  } = useInfiniteQuery({
    queryKey: ["riwayat-orders"],
    queryFn: async ({ pageParam = 1 }) => {
      return await getHistory(pageParam as number, 5);
    },
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage || lastPage.length < 5) return undefined;
      return allPages.length + 1;
    },
    initialPageParam: 1,
    staleTime: 0,
  });

  const queryData = useMemo(() => infiniteData?.pages.flat() || [], [infiniteData]);
  const [displayedData, setDisplayedData] = useState<typeof queryData>(queryData);
  const isUpdating = useRef(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (displayedData.length === 0 && queryData.length > 0) {
      timeout = setTimeout(() => setDisplayedData(queryData), 0);
      return () => clearTimeout(timeout);
    }

    if (
      queryData.length > 0 &&
      displayedData.length > 0 &&
      queryData[0].id !== displayedData[0].id
    ) {
      if (!isUpdating.current) {
        isUpdating.current = true;
        addToast("Ada data baru", "info");
        timeout = setTimeout(() => {
          setDisplayedData(queryData);
          isUpdating.current = false;
        }, 1500);
      }
    } else if (!isUpdating.current && queryData.length !== displayedData.length) {
      timeout = setTimeout(() => setDisplayedData(queryData), 0);
    }

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [queryData, displayedData, addToast]);

  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) observer.unobserve(currentTarget);
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (isPending) {
    return (
      <div className="flex-1 w-full flex justify-center items-center">
        <CardRiwayatSkeleton count={6} />
      </div>
    );
  }

  return (
    <div className="flex-1 w-full flex gap-3 flex-col content-start overflow-y-auto pb-24 pr-1 scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-700">
      {displayedData.length === 0 ? (
        <p className="text-center text-sm text-neutral-400 mt-10">
          Belum ada riwayat pesanan (selesai).
        </p>
      ) : (
        displayedData.map((riwayat, idx) => (
          <CardRiwayat
            key={idx}
            id={riwayat.id}
            date={riwayat.date}
            totalPrice={riwayat.totalPrice}
            orderType={riwayat.orderType}
            items={riwayat.items}
          />
        ))
      )}

      {isFetchingNextPage && (
        <div className="w-full py-4 flex justify-center items-center">
          <LuLoader className="animate-spin text-orange text-2xl" />
        </div>
      )}

      {hasNextPage && !isFetchingNextPage && (
        <div ref={observerTarget} className="w-full h-10" />
      )}

      {!hasNextPage && displayedData.length > 0 && (
        <p className="text-center text-xs text-neutral-400 py-4">
          Semua riwayat telah ditampilkan.
        </p>
      )}
    </div>
  );
}
