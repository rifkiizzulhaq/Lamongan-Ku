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
    const bungkusPoints = chartData
      .filter((p) => p.type === "Bungkus")
      .map((p) => [new Date(p.created_at).getTime(), p.qty]);

    const makanSiniPoints = chartData
      .filter((p) => p.type === "Makan Sini")
      .map((p) => [new Date(p.created_at).getTime(), p.qty]);

    return [
      { name: "Bungkus", data: bungkusPoints.sort((a, b) => a[0] - b[0]) },
      { name: "Makan Sini", data: makanSiniPoints.sort((a, b) => a[0] - b[0]) },
    ];
  }, [chartData]);

  const options: ApexCharts.ApexOptions = {
    chart: {
      type: "area",
      height: 350,
      toolbar: { show: false },
      zoom: { enabled: false },
      fontFamily: "inherit",
      foreColor: "#a3a3a3",
      animations: {
        enabled: true,
        speed: 800,
      },
    },
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 3 },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.45,
        opacityTo: 0.05,
        stops: [20, 100],
      },
    },
    xaxis: {
      type: "datetime",
      labels: {
        datetimeUTC: false,
        style: { colors: "#a3a3a3", fontSize: "10px" },
        format: "HH:mm",
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      title: {
        text: "Porsi Terjual",
        style: { fontWeight: 600, color: "#a3a3a3" },
      },
      labels: { style: { colors: "#a3a3a3" } },
    },
    tooltip: {
      theme: "dark",
      x: { format: "HH:mm" },
      y: { formatter: (val) => val + " Porsi" },
    },
    colors: ["#f97316", "#2563eb"],
    legend: {
      position: "top",
      horizontalAlign: "left",
      labels: { colors: "#ffffff" },
    },
    grid: {
      borderColor: "#404040",
      strokeDashArray: 4,
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
            Aliran Porsi Terjual Real-time (Berdasarkan Waktu Pesanan)
          </p>
        </div>
      </div>
      <div
        id="chart"
        className="w-full min-h-80 flex items-center justify-center"
      >
        {isLoadingChart ? (
          <div className="flex flex-col items-center gap-2">
            <LuLoader className="animate-spin text-orange" size={30} />
            <p className="text-xs text-neutral-500 font-medium">
              Memuat Statistik...
            </p>
          </div>
        ) : chartData.length > 0 ? (
          <ReactApexChart
            options={options}
            series={series}
            type="area"
            height={320}
          />
        ) : (
          <div className="text-neutral-500 text-sm font-medium py-10">
            Belum ada data penjualan hari ini
          </div>
        )}
      </div>
    </div>
  );
}
