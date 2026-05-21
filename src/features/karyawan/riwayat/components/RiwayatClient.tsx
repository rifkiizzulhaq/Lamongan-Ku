"use client";

import { useRef, useEffect } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import CardRiwayat from "./CardRiwayat";
import { getHistory } from "@/src/server/karyawan/riwayat/riwayat.server";
import { LuLoader } from "react-icons/lu";
import CardRiwayatSkeleton from "./CardRiwayatSkeleton";

export default function RiwayatClient() {
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
    staleTime: 60 * 1000,
  });

  const data = infiniteData?.pages.flat() || [];
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
      {data.length === 0 ? (
        <p className="text-center text-sm text-neutral-400 mt-10">
          Belum ada riwayat pesanan (selesai).
        </p>
      ) : (
        data.map((riwayat, idx) => (
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

      {!hasNextPage && data.length > 0 && (
        <p className="text-center text-xs text-neutral-400 py-4">
          Semua riwayat telah ditampilkan.
        </p>
      )}
    </div>
  );
}
