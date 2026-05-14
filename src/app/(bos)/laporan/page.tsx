"use client";

import { useState } from "react";
import PageHeader from "@/src/components/ui/PageHeader";
import DailyAnalytics from "@/src/features/bos/laporan/components/DailyAnalytics";
import AggregatedAnalytics from "@/src/features/bos/laporan/components/AggregatedAnalytics";
import { useQuery } from "@tanstack/react-query";
import {
  getDailyAnalytics,
  getAggregatedAnalytics,
} from "@/src/server/bos/laporan/laporan.server";
import { LuLoader } from "react-icons/lu";
import Button from "@/src/components/ui/Button";

type TabMode = "Harian" | "Mingguan" | "Bulanan" | "Tahunan";

const TABS: TabMode[] = ["Harian", "Mingguan", "Bulanan", "Tahunan"];

export default function LaporanPage() {
  const [activeTab, setActiveTab] = useState<TabMode>("Harian");

  const { data: dailyData, isLoading: isLoadingDaily } = useQuery({
    queryKey: ["analytics-daily"],
    queryFn: () => getDailyAnalytics(),
    enabled: activeTab === "Harian",
  });

  const { data: aggregatedData, isLoading: isLoadingAggregated } = useQuery({
    queryKey: ["analytics-aggregated", activeTab],
    queryFn: () =>
      getAggregatedAnalytics(activeTab as "Mingguan" | "Bulanan" | "Tahunan"),
    enabled: activeTab !== "Harian",
  });

  const isLoading =
    activeTab === "Harian" ? isLoadingDaily : isLoadingAggregated;

  return (
    <section className="h-[calc(100dvh-45px)] md:min-h-screen dark:bg-neutral-800 flex flex-col overflow-hidden">
      <PageHeader title="Analitik & Laporan" />
      <main className="relative max-w-87.5 mx-auto w-full flex flex-col h-full pt-2">
        <div className="w-full pb-2 shrink-0">
          <div className="flex bg-neutral-100 dark:bg-neutral-900 rounded-xl p-1 overflow-x-auto scrollbar-none">
            {TABS.map((tab) => (
              <Button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 min-w-20 py-2 text-xs font-bold rounded-lg transition-all ${
                  activeTab === tab
                    ? "bg-white dark:bg-neutral-700 text-black dark:text-white shadow-sm"
                    : "text-neutral-600 hover:text-black dark:text-neutral-400 dark:hover:text-white"
                }`}
              >
                {tab}
              </Button>
            ))}
          </div>
        </div>

        <div className="relative w-full flex flex-col h-full overflow-y-auto pb-20 scrollbar-thin scrollbar-thumb-neutral-200 dark:scrollbar-thumb-neutral-700">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
              <LuLoader className="animate-spin text-orange" size={32} />
              <p className="text-sm font-bold text-neutral-500 animate-pulse">
                Menghitung data laporan...
              </p>
            </div>
          ) : (
            <>
              {activeTab === "Harian" && dailyData && (
                <DailyAnalytics data={dailyData} />
              )}

              {activeTab === "Mingguan" && aggregatedData && (
                <AggregatedAnalytics
                  data={aggregatedData}
                  titleSuffix="(Mingguan)"
                  intervalName="Hari"
                />
              )}

              {activeTab === "Bulanan" && aggregatedData && (
                <AggregatedAnalytics
                  data={aggregatedData}
                  titleSuffix="(Bulanan)"
                  intervalName="Hari"
                />
              )}

              {activeTab === "Tahunan" && aggregatedData && (
                <AggregatedAnalytics
                  data={aggregatedData}
                  titleSuffix="(Tahunan)"
                  intervalName="Bulan"
                />
              )}
            </>
          )}
        </div>
      </main>
    </section>
  );
}
