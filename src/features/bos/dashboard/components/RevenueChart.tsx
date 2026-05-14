"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getRevenueChartData } from "@/src/server/bos/dashboard/dashboard.server";
import { useSupabaseRealtime } from "@/src/hooks/useSupabaseRealtime";
import { LuLoader } from "react-icons/lu";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function RevenueChart() {
  useSupabaseRealtime("orders", ["revenue-chart"]);
  useSupabaseRealtime("order_items", ["revenue-chart"]);

  const { data: chartData = [], isLoading: isLoadingChart } = useQuery({
    queryKey: ["revenue-chart"],
    queryFn: async () => await getRevenueChartData(),
  });

  const { series, categories } = useMemo(() => {
    const sortedData = [...chartData].sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );

    if (sortedData.length === 0) return { series: [], categories: [] };

    const bungkusMap: Record<number, number> = {};
    const makanSiniMap: Record<number, number> = {};

    const toShiftMinutes = (isoStr: string): number => {
      const d = new Date(isoStr);
      const wib = new Date(
        d.toLocaleString("en-US", { timeZone: "Asia/Jakarta" }),
      );
      const h = wib.getHours();
      const m = wib.getMinutes();
      return h < 6 ? (h + 24) * 60 + m : h * 60 + m;
    };

    sortedData.forEach((p) => {
      const key = toShiftMinutes(p.created_at);
      if (p.type === "Bungkus") {
        bungkusMap[key] = (bungkusMap[key] || 0) + p.qty;
      } else {
        makanSiniMap[key] = (makanSiniMap[key] || 0) + p.qty;
      }
    });

    const allMinutes = Array.from(
      new Set(
        [...Object.keys(bungkusMap), ...Object.keys(makanSiniMap)].map(Number),
      ),
    ).sort((a, b) => a - b);

    const minutesToLabel = (mins: number) => {
      const adj = mins >= 1440 ? mins - 1440 : mins;
      const h = Math.floor(adj / 60);
      const m = adj % 60;
      return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    };

    return {
      categories: allMinutes.map(minutesToLabel),
      series: [
        {
          name: "Bungkus",
          data: allMinutes.map((mins, idx) => ({
            x: idx,
            y: bungkusMap[mins] || 0,
          })),
        },
        {
          name: "Makan Sini",
          data: allMinutes.map((mins, idx) => ({
            x: idx,
            y: makanSiniMap[mins] || 0,
          })),
        },
      ],
    };
  }, [chartData]);

  const options: ApexCharts.ApexOptions = {
    chart: {
      type: "bar",
      height: 350,
      stacked: true,
      toolbar: { show: false },
      zoom: { enabled: false },
      fontFamily: "inherit",
      foreColor: "#a3a3a3",
    },
    plotOptions: {
      bar: {
        columnWidth: "40%",
        borderRadius: 4,
        dataLabels: { position: "top" },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val) => (Number(val) === 0 ? "" : String(val)),
      offsetY: -20,
      style: {
        fontSize: "10px",
        fontWeight: "900",
        colors: ["#f97316", "#2563eb"],
      },
    },
    xaxis: {
      type: "numeric",
      labels: {
        style: { colors: "#a3a3a3", fontSize: "9px", fontWeight: 700 },
        rotate: -45,
        rotateAlways: true,
        formatter: (val) => {
          const idx = Math.round(Number(val));
          return categories[idx] ?? "";
        },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
      tooltip: { enabled: false },
    },
    yaxis: {
      title: {
        text: "Porsi",
        style: { fontWeight: 800, color: "#f97316" },
      },
      labels: {
        style: { colors: "#a3a3a3" },
        formatter: (val) => val.toFixed(0),
      },
    },
    tooltip: {
      theme: "dark",
      shared: true,
      intersect: false,
      y: { formatter: (val) => val + " Porsi" },
    },
    colors: ["#f97316", "#2563eb"],
    legend: {
      position: "top",
      horizontalAlign: "left",
      labels: { colors: "#a3a3a3" },
    },
    grid: {
      borderColor: "#333333",
      strokeDashArray: 4,
      padding: { left: 10, right: 10 },
    },
  };

  return (
    <div className="w-full border border-neutral-200 dark:border-neutral-700 rounded-2xl p-5">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-extrabold dark:text-white mb-1">
            Statistik Penjualan
          </h3>
          <p className="text-xs dark:text-neutral-400 text-neutral-700 font-medium">
            Volume Porsi Per Pesanan (Real-time)
          </p>
        </div>
      </div>
      <div className="w-full overflow-x-auto pb-4 custom-scrollbar">
        <div
          className="min-h-80"
          style={{
            minWidth:
              categories.length > 8 ? `${categories.length * 50}px` : "100%",
          }}
        >
          {isLoadingChart ? (
            <div className="h-80 flex flex-col items-center justify-center gap-2">
              <LuLoader className="animate-spin text-orange" size={30} />
              <p className="text-xs text-neutral-500 font-medium">
                Memuat Statistik...
              </p>
            </div>
          ) : categories.length > 0 ? (
            <ReactApexChart
              options={options}
              series={series}
              type="bar"
              height={320}
            />
          ) : (
            <div className="h-80 flex items-center justify-center text-neutral-500 text-sm font-medium">
              Belum ada data penjualan hari ini
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
