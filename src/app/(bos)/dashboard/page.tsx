"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  DashboardWeatherItem,
} from "@/interfaces/dashboard";
import { useSupabaseRealtime } from "@/src/hooks/useSupabaseRealtime";
import {
  updateShopStatus,
  getDashboardStats,
} from "@/src/server/bos/dashboard/dashboard.server";
import {
  LuDollarSign,
  LuShoppingBag,
  LuPen,
  LuCloud,
  LuNotebook,
  LuLoader,
  LuInfo,
  LuHistory,
} from "react-icons/lu";
import PageHeader from "@/src/components/ui/PageHeader";
import Button from "@/src/components/ui/Button";
import StatCard from "@/src/features/bos/dashboard/components/StatCard";
import RevenueChart from "@/src/features/bos/dashboard/components/RevenueChart";

import DashboardSkeleton from "@/src/components/ui/DashboardSkeleton";
import { useUiStore } from "@/src/store/uiStore";

export default function Page() {
  const queryClient = useQueryClient();
  const [catatanLibur, setCatatanLibur] = useState("");
  const [pendingBuka, setPendingBuka] = useState(true);

  const { addToast, showConfirm } = useUiStore();

  useSupabaseRealtime("orders", ["dashboard-stats", "revenue-chart"]);
  useSupabaseRealtime("order_items", ["dashboard-stats", "revenue-chart"]);
  useSupabaseRealtime("stock", ["dashboard-stats"]);
  useSupabaseRealtime("daily_reports", ["dashboard-stats"]);
  useSupabaseRealtime("shop_status", ["dashboard-stats"]);

  const { data: stats, isPending, isFetching } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => await getDashboardStats(),
  });

  const lastToastTime = useRef<number>(0);

  useEffect(() => {
    if (isFetching && !isPending) {
      const now = Date.now();
      if (now - lastToastTime.current > 10000) {
        addToast("Data terbaru disinkronisasi (Real-time)", "info");
        lastToastTime.current = now;
      }
    }
  }, [isFetching, isPending, addToast]);

  const { mutate: updateStatus, isPending: isUpdatingStatus } = useMutation({
    mutationFn: (isBuka: boolean) => updateShopStatus(isBuka, catatanLibur),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
        queryClient.invalidateQueries({ queryKey: ["shop-status"] });
        setCatatanLibur("");
        setPendingBuka(true);
        addToast("Berhasil update status warung!", "success");
      } else {
        addToast(res.error || "Gagal update status", "error");
      }
    },
  });

  if (isPending || !stats) {
    return (
      <section className="h-[calc(100dvh-45px)] md:min-h-screen dark:bg-neutral-800 flex flex-col overflow-hidden">
        <PageHeader title="Dashboard" />
        <main className="relative max-w-87.5 mx-auto w-full flex flex-col h-full overflow-hidden">
          <DashboardSkeleton />
        </main>
      </section>
    );
  }

  const formattedPendapatan = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(
    stats.isClosed
      ? stats.pendapatanFisik || stats.pendapatan || 0
      : stats.pendapatan || 0,
  );

  return (
    <section className="h-[calc(100dvh-45px)] md:min-h-screen dark:bg-neutral-800 flex flex-col overflow-hidden">
      <PageHeader title="Dashboard" />
      <main className="relative max-w-87.5 mx-auto w-full flex flex-col h-full pt-2 overflow-y-auto pb-8">
        {stats.shopStatus?.isBuka === 0 && (
          <div className="w-full mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded-xl flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white shrink-0">
              <LuInfo size={24} />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-black text-blue-800 dark:text-blue-300 uppercase tracking-widest">
                Warung Sedang Libur
              </h4>
              <p className="text-xs text-blue-700 dark:text-blue-400 font-medium mt-1">
                Alasan:{" "}
                <span className="italic font-bold">
                  {stats.shopStatus?.reason || "Tidak ada alasan spesifik"}
                </span>
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="w-full flex justify-between items-center px-4 py-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm">
            <div className="flex flex-col">
              <p className="text-sm font-extrabold text-neutral-800 dark:text-white">
                Status Warung
              </p>
              <p
                className={`text-[11px] font-bold uppercase tracking-widest mt-0.5 ${stats.shopStatus?.isBuka === 1 ? "text-emerald-500" : "text-rose-500"}`}
              >
                {stats.shopStatus?.isBuka === 1
                  ? "Sedang Buka"
                  : "Sedang Libur"}
              </p>
            </div>

            <Button
              onClick={() => {
                if (stats.shopStatus?.isBuka === 0) {
                  const now = new Date();
                  const formatter = new Intl.DateTimeFormat("en-US", {
                    timeZone: "Asia/Jakarta",
                    hour: "numeric",
                    minute: "numeric",
                    hour12: false,
                  });
                  const parts = formatter.formatToParts(now);
                  const nowHour = parseInt(parts.find((p) => p.type === "hour")?.value || "0");
                  const nowMin = parseInt(parts.find((p) => p.type === "minute")?.value || "0");
                  if (
                    nowHour > 18 ||
                    (nowHour === 18 && nowMin >= 30) ||
                    nowHour < 6
                  ) {
                    addToast(
                      "Sudah melewati batas waktu (18:30) untuk membuka warung hari ini. Harap tunggu shift berikutnya.",
                      "error",
                    );
                    return;
                  }

                  showConfirm(
                    "Buka Warung?",
                    "Apakah Anda yakin ingin membuka kembali warung?",
                    () => updateStatus(true),
                  );
                } else {
                  if (!stats.isClosed && (stats.pesananCount > 0 || stats.pendapatan > 0)) {
                    addToast(
                      "Warung sedang beroperasi! Anda hanya dapat mengubah status menjadi libur setelah shift selesai dan melakukan Tutup Warung.",
                      "error",
                    );
                    return;
                  }
                  setPendingBuka(!pendingBuka);
                }
              }}
              className={`relative w-14 h-8 rounded-full transition-colors duration-300 ease-in-out focus:outline-none shrink-0 border-2 ${stats.shopStatus?.isBuka === 1
                  ? "bg-emerald-500 border-emerald-500"
                  : "bg-neutral-200 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-800"
                }`}
            >
              <div
                className={`absolute top-0.5 left-0.5 bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ease-in-out flex items-center justify-center ${stats.shopStatus?.isBuka === 1
                    ? "translate-x-6"
                    : "translate-x-0"
                  }`}
              />
            </Button>
          </div>

          {stats.shopStatus?.isBuka === 1 && !pendingBuka && (
            <div className="w-full md:col-span-2 p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm flex flex-col gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-2">
                <LuHistory size={16} className="text-orange" />
                <h2 className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                  Rencana Libur / Tutup Warung
                </h2>
              </div>
              <textarea
                value={catatanLibur}
                onChange={(e) => setCatatanLibur(e.target.value)}
                className="border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800 text-neutral-800 dark:text-white text-sm placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange/50 rounded-xl p-3 resize-none h-20 transition-all"
                placeholder="Berikan alasan libur (sakit, urusan keluarga, dll)..."
              ></textarea>
              <div className="flex justify-end gap-2">
                <Button
                  onClick={() => setPendingBuka(true)}
                  className="bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-bold py-2 px-4 rounded-xl"
                >
                  Batal
                </Button>
                <Button
                  onClick={() => updateStatus(false)}
                  disabled={isUpdatingStatus || !catatanLibur}
                  className="bg-orange hover:bg-orange-600 text-white font-bold py-2 px-6 rounded-xl shadow-lg shadow-orange-500/20 transition-all active:scale-95 disabled:opacity-50"
                >
                  {isUpdatingStatus ? (
                    <LuLoader className="animate-spin" />
                  ) : (
                    "Simpan & Libur"
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="w-full mt-4 flex flex-col gap-4 md:px-0">
          <StatCard
            title={
              stats.isClosed
                ? "Total Uang Fisik (Cash)"
                : "Total Pendapatan Hari Ini"
            }
            icon={<LuDollarSign size={20} strokeWidth={2.5} />}
            edit={
              stats.isClosed && stats.shopStatus?.isBuka === 1 ? (
                <LuPen size={20} strokeWidth={2.5} />
              ) : undefined
            }
            editHref={
              stats.isClosed && stats.shopStatus?.isBuka === 1
                ? "/dashboard/pendapatan"
                : undefined
            }
          >
            <div className="flex items-baseline gap-1">
              <h2 className="text-2xl font-black text-neutral-800 dark:text-white tracking-tight">
                {formattedPendapatan}
              </h2>
            </div>
          </StatCard>

          <StatCard
            title="Total Pesanan Hari Ini"
            icon={<LuShoppingBag size={20} strokeWidth={2.5} />}
          >
            <h2 className="text-2xl font-black text-neutral-800 dark:text-white tracking-tight">
              {stats.pesananCount || 0}{" "}
              <span className="text-sm text-neutral-400 font-bold uppercase ml-1">
                Transaksi
              </span>
            </h2>
          </StatCard>

          <StatCard
            title="Log Cuaca Hari Ini"
            icon={<LuCloud size={20} strokeWidth={2.5} />}
          >
            {stats.weathers && stats.weathers.length > 0 ? (
              <div className="flex flex-wrap gap-2 mt-2">
                {stats.weathers.map((w: DashboardWeatherItem) => (
                  <div
                    key={w.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 dark:bg-neutral-700/50 rounded-xl border border-neutral-200 dark:border-neutral-800"
                  >
                    <LuCloud className="text-blue-500" size={14} />
                    <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                      {w.timeRange}: {w.weather}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-neutral-400 mt-2 font-medium">
                Belum ada log cuaca untuk hari ini.
              </p>
            )}
          </StatCard>

          <StatCard
            title="Catatan Tutup Warung"
            icon={<LuNotebook size={20} strokeWidth={2.5} />}
          >
            <div className="mt-2 p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-xl">
              <p className="text-sm text-neutral-600 dark:text-neutral-400 font-medium">
                {stats.note || "Belum ada catatan."}
              </p>
            </div>
          </StatCard>
        </div>

        <div className="w-full mt-4">
          <RevenueChart />
        </div>
      </main>
    </section>
  );
}
