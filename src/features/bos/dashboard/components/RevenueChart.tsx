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

  const series = useMemo(() => {
    const sortedData = [...chartData].sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );

    if (sortedData.length === 0) return [];

    const bungkusMap: Record<string, number> = {};
    const makanSiniMap: Record<string, number> = {};

    sortedData.forEach((p) => {
      const timeStr = new Date(p.created_at).toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });

      if (p.type === "Bungkus") {
        bungkusMap[timeStr] = (bungkusMap[timeStr] || 0) + p.qty;
      } else {
        makanSiniMap[timeStr] = (makanSiniMap[timeStr] || 0) + p.qty;
      }
    });

    const allTimes = Array.from(
      new Set([...Object.keys(bungkusMap), ...Object.keys(makanSiniMap)]),
    ).sort();

    return [
      {
        name: "Bungkus",
        data: allTimes.map((t) => ({ x: t, y: bungkusMap[t] || 0 })),
      },
      {
        name: "Makan Sini",
        data: allTimes.map((t) => ({ x: t, y: makanSiniMap[t] || 0 })),
      },
    ];
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
      formatter: (val) => (Number(val) === 0 ? "" : val),
      offsetY: -20,
      style: {
        fontSize: "10px",
        fontWeight: "900",
        colors: ["#f97316", "#2563eb"],
      },
    },
    xaxis: {
      type: "category",
      labels: {
        style: { colors: "#a3a3a3", fontSize: "9px", fontWeight: 700 },
        rotate: -45,
        rotateAlways: true,
        hideOverlappingLabels: true,
        trim: true,
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
              chartData.length > 8 ? `${chartData.length * 50}px` : "100%",
          }}
        >
          {isLoadingChart ? (
            <div className="h-80 flex flex-col items-center justify-center gap-2">
              <LuLoader className="animate-spin text-orange" size={30} />
              <p className="text-xs text-neutral-500 font-medium">
                Memuat Statistik...
              </p>
            </div>
          ) : chartData.length > 0 ? (
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
