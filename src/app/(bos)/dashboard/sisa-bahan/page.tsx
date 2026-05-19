"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import PageHeader from "@/src/components/ui/PageHeader";
import Button from "@/src/components/ui/Button";
import Link from "next/link";
import { LuLoader, LuPackage, LuSave } from "react-icons/lu";
import {
  getDashboardStats,
  updateStockInventory,
} from "@/src/server/bos/dashboard/dashboard.server";
import LockedPage from "@/src/components/ui/LockedPage";
import { useUiStore } from "@/src/store/uiStore";

interface SisaItemLocal {
  stockId: number;
  nama: string;
  sisa: number;
}

export default function SisaBahanPage() {
  const { addToast } = useUiStore();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [items, setItems] = useState<SisaItemLocal[]>([]);

  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => await getDashboardStats(),
    staleTime: 0,
    gcTime: 0,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    const Stats = () => {
      if (stats?.sisaBahan) {
        setItems(
          stats.sisaBahan.map(
            (s: { id: number; nama: string; sisa: number | null }) => ({
              stockId: s.id,
              nama: s.nama,
              sisa: s.sisa ?? 0,
            }),
          ),
        );
      }
    };
    Stats();
  }, [stats]);

  const { mutate: simpan, isPending } = useMutation({
    mutationFn: (payload: { stockId: number; sisa: number }[]) =>
      updateStockInventory(payload),
    onSuccess: (res: { success: boolean; error?: string }) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
        queryClient.invalidateQueries({ queryKey: ["stock-list"] });
        addToast("Sisa bahan berhasil disave!", "success");
        router.push("/dashboard");
      } else {
        addToast(res.error || "Terjadi kesalahan", "error");
      }
    },
  });

  const updateItemQty = (idx: number, val: number) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === idx ? { ...item, sisa: Math.max(0, val) } : item,
      ),
    );
  };

  if (isLoading || !stats) {
    return (
      <div className="h-screen flex items-center justify-center dark:bg-neutral-800">
        <LuLoader className="animate-spin text-orange" size={40} />
      </div>
    );
  }

  if (stats.shopStatus?.isBuka === 0 || !stats.isClosed) {
    return (
      <LockedPage
        type={stats.shopStatus?.isBuka === 0 ? "holiday" : "locked"}
        customMessage={
          stats.shopStatus?.isBuka === 0
            ? "Anda tidak bisa melakukan koreksi stok karena status warung saat ini sedang LIBUR."
            : undefined
        }
      />
    );
  }

  if (items.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center dark:bg-neutral-800">
        <p className="text-neutral-500">Data stok tidak tersedia.</p>
      </div>
    );
  }

  return (
    <section className="h-[calc(100dvh-45px)] w-full md:min-h-screen dark:bg-neutral-800 flex flex-col overflow-hidden">
      <PageHeader title="Koreksi Stok" />
      <main className="relative max-w-87.5 mx-auto w-full flex-1 flex flex-col overflow-y-auto pt-4 pb-10">
        <div className="flex flex-col p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-sm w-full">
          <div className="flex items-center gap-3 mb-6 border-b border-neutral-100 dark:border-neutral-800 pb-4">
            <div className="w-10 h-10 bg-orange/10 rounded-xl flex items-center justify-center text-orange">
              <LuPackage size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                Data Stok Fisik
              </p>
              <h3 className="text-sm font-black dark:text-white">
                Sesuaikan Sisa Bahan
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-y-1">
            {items.map((item, idx) => (
              <div
                key={item.stockId}
                className="flex items-center justify-between gap-4 py-3 border-b border-neutral-50 dark:border-neutral-800/50 last:border-0"
              >
                <span className="text-sm font-bold text-neutral-700 dark:text-neutral-300">
                  {item.nama}
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    value={item.sisa === 0 ? "" : item.sisa}
                    onChange={(e) =>
                      updateItemQty(idx, parseInt(e.target.value) || 0)
                    }
                    placeholder="0"
                    className="w-16 h-10 bg-neutral-100 dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 text-center text-base font-black rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:border-orange transition-all placeholder:text-neutral-400 shrink-0"
                  />
                  <span className="text-[10px] font-bold text-neutral-400 uppercase">
                    Porsi
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex w-full gap-3">
            <Link
              href="/dashboard"
              className="flex-1 flex items-center justify-center bg-neutral-100 dark:bg-neutral-100 text-neutral-800 dark:text-neutral-800 font-bold py-4 rounded-2xl hover:bg-neutral-200 transition-colors"
            >
              Batal
            </Link>
            <Button
              onClick={() => {
                const changedItems = items.filter((item) => {
                  const original = stats.sisaBahan.find(
                    (s) => s.id === item.stockId,
                  );
                  return original && item.sisa !== (original.sisa ?? 0);
                });

                if (changedItems.length === 0) {
                  router.push("/dashboard");
                  return;
                }

                simpan(
                  changedItems.map((i) => ({
                    stockId: i.stockId,
                    sisa: i.sisa,
                  })),
                );
              }}
              disabled={isPending}
              className="flex-1 bg-orange hover:bg-orange-600 text-white font-black uppercase tracking-widest py-4 rounded-2xl shadow-lg shadow-orange-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              {isPending ? (
                <LuLoader className="animate-spin" />
              ) : (
                <>
                  <LuSave size={18} />
                  Simpan
                </>
              )}
            </Button>
          </div>
        </div>
      </main>
    </section>
  );
}
