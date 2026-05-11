"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import CardBungkus, { CardBungkusProps } from "./CardBungkus";
import { getAll } from "@/src/server/karyawan/bungkus/bungkus.server";
import { LuLoader } from "react-icons/lu";

export default function BungkusClient({
  initialData,
}: {
  initialData: CardBungkusProps[];
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
      const result = await getAll(nextPage, 5);
      if (result.length === 0) {
        setHasMore(false);
      } else {
        setData((prev) => {
          const newItems = result.filter(
            (r) => !prev.some((p) => p.orderId === r.id),
          );
          const formattedResult = newItems.map((r) => ({
            orderId: r.id,
            id: r.label,
            totalPrice: r.totalPrice,
            status: r.status,
            items: r.items,
          }));
          return [...prev, ...formattedResult];
        });
        setPage(nextPage);
        if (result.length < 5) {
          setHasMore(false);
        }
      }
    } catch (error) {
      console.error("Failed to load more antrean bungkus:", error);
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
    <div className="flex-1 overflow-y-auto flex flex-col gap-4 pb-30 scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-700">
      {data.length === 0 ? (
        <p className="text-center text-neutral-400 dark:text-neutral-600 text-sm mt-10">
          Belum ada pesanan bungkus.
        </p>
      ) : (
        data.map((pesanan) => (
          <CardBungkus
            key={pesanan.orderId}
            orderId={pesanan.orderId}
            id={pesanan.id}
            totalPrice={pesanan.totalPrice}
            status={pesanan.status}
            items={pesanan.items}
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
          Semua antrean telah ditampilkan.
        </p>
      )}
    </div>
  );
}
