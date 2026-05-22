"use client";

import { useRef, useEffect } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import CardBungkus from "./CardBungkus";
import { getAll } from "@/src/server/karyawan/bungkus/bungkus.server";
import { useSupabaseRealtime } from "@/src/hooks/useSupabaseRealtime";
import CardBungkusSkeleton from "./CardBungkusSkeleton";
import { LuLoader } from "react-icons/lu";

import Link from "next/link";
import Button from "@/src/components/ui/Button";
import { LuPlus } from "react-icons/lu";

export default function BungkusClient({ isClosed }: { isClosed: boolean }) {
  useSupabaseRealtime("orders", ["bungkus-orders"]);
  const {
    data: infiniteData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ["bungkus-orders"],
    queryFn: async ({ pageParam = 1 }) => {
      const result = await getAll(pageParam as number, 5);
      return result.map((r) => ({
        orderId: r.id,
        id: r.label,
        totalPrice: r.totalPrice,
        status: r.status,
        items: r.items,
      }));
    },
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage || lastPage.length < 5) return undefined;
      return allPages.length + 1;
    },
    initialPageParam: 1,
    staleTime: 0,
  });

  const orders = infiniteData?.pages.flat() || [];
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

  return (
    <>
      {!isLoading && (
        <div className="absolute bottom-15 right-0 z-50">
          {isClosed ? (
            <div className="flex items-center gap-1 bg-neutral-400 text-white cursor-not-allowed shadow-lg font-bold py-2 px-3 rounded-full opacity-60">
              Warung Tutup
            </div>
          ) : (
            <Link href="/bungkus/ordering">
              <Button className="flex items-center gap-1 dark:bg-white bg-neutral-800 text-white hover:bg-neutral-200 shadow-lg dark:text-black font-bold py-2 px-3 rounded-full scale-100 active:scale-95 transition-transform">
                <LuPlus size={24} strokeWidth={3} />
                Tambah Pesanan
              </Button>
            </Link>
          )}
        </div>
      )}

      <div className="flex-1 overflow-y-auto flex flex-col gap-4 pb-30 scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-700">
        {isLoading ? (
          <CardBungkusSkeleton count={5} />
        ) : orders.length === 0 ? (
          <p className="text-center text-neutral-400 dark:text-neutral-600 text-sm mt-10">
            Belum ada pesanan bungkus.
          </p>
        ) : (
          orders.map((pesanan) => (
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

        {isFetchingNextPage && (
          <div className="w-full py-4 flex justify-center items-center">
            <LuLoader className="animate-spin text-orange" size={24} />
          </div>
        )}

        {hasNextPage && !isFetchingNextPage && (
          <div ref={observerTarget} className="w-full h-10" />
        )}

        {!hasNextPage && orders.length > 0 && (
          <p className="text-center text-xs text-neutral-400 py-4">
            Semua antrean telah ditampilkan.
          </p>
        )}
      </div>
    </>
  );
}
