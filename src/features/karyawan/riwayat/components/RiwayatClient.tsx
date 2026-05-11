"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import CardRiwayat, { CardRiwayatProps } from "./CardRiwayat";
import { getHistory } from "@/src/server/karyawan/riwayat/riwayat.server";
import { LuLoader } from "react-icons/lu";

export default function RiwayatClient({
  initialData,
}: {
  initialData: CardRiwayatProps[];
}) {
  const [data, setData] = useState(initialData);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialData.length === 5);
  const [isLoading, setIsLoading] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);
    try {
      const nextPage = page + 1;
      const result = await getHistory(nextPage, 5);
      if (result.length === 0) {
        setHasMore(false);
      } else {
        setData((prev) => [...prev, ...result]);
        setPage(nextPage);
        if (result.length < 5) {
          setHasMore(false);
        }
      }
    } catch (error) {
      console.error("Failed to load more history:", error);
    } finally {
      setIsLoading(false);
    }
  }, [page, isLoading, hasMore]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
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
  }, [loadMore]);

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

      {hasMore && data.length > 0 && (
        <div
          ref={observerTarget}
          className="w-full py-4 flex justify-center items-center"
        >
          <LuLoader className="animate-spin text-orange text-2xl" />
        </div>
      )}

      {!hasMore && data.length > 0 && (
        <p className="text-center text-xs text-neutral-400 py-4">
          Semua riwayat telah ditampilkan.
        </p>
      )}
    </div>
  );
}
