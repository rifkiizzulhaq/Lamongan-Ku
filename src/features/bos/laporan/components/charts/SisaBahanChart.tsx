"use client";

import dynamic from "next/dynamic";
import { SisaBahanData } from "@/interfaces/models";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

interface Props {
  data: SisaBahanData[];
  currentLabel: string;
  previousLabel: string;
  showComparison?: boolean;
}

export default function SisaBahanChart({
  data,
  currentLabel,
  previousLabel,
  showComparison,
}: Props) {
  const series: { name: string; data: number[]; color?: string }[] = [];

  series.push(
    {
      name: `Awal ${currentLabel}`,
      data: data.map((d) => d.stockAwalCurrent ?? 0),
      color: "#fb923c",
    },
    {
      name: `Akhir ${currentLabel}`,
      data: data.map((d) => d.sisaCurrent),
      color: "#f97316",
    },
  );

  if (showComparison !== false) {
    series.push(
      {
        name: `Awal ${previousLabel}`,
        data: data.map((d) => d.stockAwalPrevious ?? 0),
        color: "#6b7280",
      },
      {
        name: `Akhir ${previousLabel}`,
        data: data.map((d) => d.sisaPrevious),
        color: "#3f3f46",
      },
    );
  }

  const options: ApexCharts.ApexOptions = {
    chart: {
      type: "bar",
      toolbar: { show: false },
      fontFamily: "inherit",
      foreColor: "#737373",
    },
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: "80%",
        borderRadius: 3,
      },
    },
    dataLabels: {
      enabled: true,
      style: {
        fontSize: "10px",
        colors: ["#fff"],
      },
      dropShadow: {
        enabled: true,
        top: 1,
        left: 1,
        blur: 1,
        color: "#000",
        opacity: 0.8,
      },
    },
    stroke: { show: true, width: 1, colors: ["transparent"] },
    xaxis: {
      categories: data.map((d) => d.nama),
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { show: false },
    },
    yaxis: {
      labels: {
        style: { colors: "#737373", fontWeight: 600 },
      },
    },
    tooltip: {
      theme: "dark",
      y: { formatter: (val) => val + " pcs" },
    },
    legend: {
      position: "top",
      horizontalAlign: "left",
      labels: { colors: "#737373" },
      showForSingleSeries: true,
      // @ts-expect-error Property 'radius' exists at runtime but is missing from ApexCharts typings
      markers: { radius: 2 },
    },
    grid: {
      borderColor: "#404040",
      strokeDashArray: 4,
      xaxis: { lines: { show: true } },
      yaxis: { lines: { show: false } },
    },
  };

  const chartHeight = Math.max(300, data.length * 80 + 100);

  return (
    <div className="w-full border border-neutral-200 dark:border-neutral-700 rounded-2xl p-5 bg-white dark:bg-neutral-800">
      <div className="mb-4">
        <h3 className="text-lg font-extrabold dark:text-white mb-1">
          Sisa Bahan (Menu)
        </h3>
        <p className="text-xs dark:text-neutral-400 text-neutral-700 font-medium">
          Stock Awal → Akhir: {currentLabel} vs {previousLabel}
        </p>
      </div>

      <div className="w-full overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-700 max-h-105">
        <div style={{ height: chartHeight }}>
          <ReactApexChart
            options={options}
            series={series}
            type="bar"
            height="100%"
          />
        </div>
      </div>
    </div>
  );
}
