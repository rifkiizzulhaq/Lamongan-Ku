"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Button from "@/src/components/ui/Button";
import Input from "@/src/components/ui/Input";
import PageHeader from "@/src/components/ui/PageHeader";
import Link from "next/link";
import { LuDollarSign, LuLoader, LuCheck, LuTriangle } from "react-icons/lu";
import {
  getDashboardStats,
  saveActualRevenue,
} from "@/src/server/bos/dashboard/dashboard.server";
import LockedPage from "@/src/components/ui/LockedPage";

export default function Page() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [uangFisik, setUangFisik] = useState<string>("");

  const formatIDR = (val: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(val);

  const handleUangFisikChange = (value: string) => {
    setUangFisik(value.replace(/\D/g, ""));
  };

  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => await getDashboardStats(),
    staleTime: 0,
    gcTime: 0,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    const UangFisiks = () => {
      if (stats?.pendapatanFisik && uangFisik === "") {
        setUangFisik(stats.pendapatanFisik.toString());
      }
    };
    UangFisiks();
  }, [stats, uangFisik]);

  const { mutate: simpan, isPending } = useMutation({
    mutationFn: (val: number) => saveActualRevenue(val),
    onSuccess: (res: { success: boolean; error?: string }) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
        router.push("/dashboard");
      } else {
        alert(res.error);
      }
    },
  });

  if (isLoading || !stats) {
    return (
      <div className="h-[calc(100dvh-45px)] flex items-center justify-center dark:bg-neutral-800">
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
            ? "Anda tidak bisa menginput uang fisik karena status warung saat ini sedang LIBUR."
            : undefined
        }
      />
    );
  }

  const systemRevenue = stats.pendapatan || 0;
  const physicalCash = parseInt(uangFisik) || 0;
  const selisih = physicalCash - systemRevenue;

  return (
    <section className="h-[calc(100dvh-45px)] w-full md:min-h-screen dark:bg-neutral-800 flex flex-col overflow-hidden">
      <PageHeader title="Input Uang Fisik" />
      <main className="relative max-w-87.5 mx-auto w-full flex-1 flex flex-col overflow-hidden pt-4 px-4">
        <div className="flex flex-col p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-sm w-full mb-6">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-orange/10 border border-orange/20 rounded-2xl flex items-center justify-center text-orange">
              <LuDollarSign size={24} strokeWidth={2.5} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded-md">
              Sistem
            </span>
          </div>

          <p className="text-neutral-500 dark:text-neutral-400 text-xs font-bold uppercase tracking-wider mb-1">
            Pendapatan di Aplikasi
          </p>
          <h2 className="text-3xl font-black text-neutral-900 dark:text-white tracking-tight">
            {formatIDR(systemRevenue)}
          </h2>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="pendapatan"
              className="text-xs font-black uppercase tracking-widest text-neutral-400 ml-1"
            >
              Jumlah Uang Fisik (Cash)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-neutral-400">
                Rp
              </span>
              <Input
                id="pendapatan"
                type="text"
                inputMode="numeric"
                value={uangFisik ? formatIDR(Number(uangFisik)) : ""}
                onChange={(e) => handleUangFisikChange(e.target.value)}
                placeholder="Rp 0"
                className="w-full pl-12 pr-4 py-4 bg-white dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-800 rounded-2xl text-xl font-black text-neutral-900 dark:text-white focus:outline-none focus:border-orange transition-all placeholder:text-neutral-300"
              />
            </div>
          </div>

          <div
            className={`group relative overflow-hidden rounded-2xl border-l-8 flex items-center transition-all ${
              selisih === 0
                ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500"
                : selisih > 0
                  ? "bg-blue-50 dark:bg-blue-900/20 border-blue-500"
                  : "bg-rose-50 dark:bg-rose-900/20 border-rose-500"
            }`}
          >
            <div className="flex flex-col p-4 flex-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-1">
                Selisih / Varian
              </p>
              <div className="flex items-center gap-2">
                <h2
                  className={`text-xl font-black ${
                    selisih === 0
                      ? "text-emerald-600"
                      : selisih > 0
                        ? "text-blue-600"
                        : "text-rose-600"
                  }`}
                >
                  {selisih === 0 ? "PAS (Sesuai)" : formatIDR(selisih)}
                </h2>
                {selisih === 0 ? (
                  <LuCheck className="text-emerald-500" />
                ) : (
                  <LuTriangle
                    className={selisih > 0 ? "text-blue-500" : "text-rose-500"}
                  />
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 flex w-full gap-3">
            <Link
              href="/dashboard"
              className="flex-1 flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-bold py-4 rounded-2xl hover:bg-neutral-200 transition-colors"
            >
              Batal
            </Link>
            <Button
              onClick={() => simpan(physicalCash)}
              disabled={isPending || !uangFisik}
              className="flex-2 bg-orange hover:bg-orange-600 text-white font-black uppercase tracking-widest py-4 rounded-2xl shadow-lg shadow-orange-500/20 transition-all active:scale-95 disabled:opacity-50"
            >
              {isPending ? (
                <LuLoader className="animate-spin mx-auto" />
              ) : (
                "Simpan Laporan"
              )}
            </Button>
          </div>
        </div>
      </main>
    </section>
  );
}
