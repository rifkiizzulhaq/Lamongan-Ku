"use client";

import dynamic from "next/dynamic";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

interface Props {
  title: string;
  subtitle: string;
  labels: string[];
  currentLabel: string;
  previousLabel: string;
  dineInTrend: number[];
  takeawayTrend: number[];
  dineInPreviousTrend: number[];
  takeawayPreviousTrend: number[];
}

export default function OrderTypeTimelineChart({
  title,
  subtitle,
  labels,
  currentLabel,
  previousLabel,
  dineInTrend,
  takeawayTrend,
  dineInPreviousTrend,
  takeawayPreviousTrend,
}: Props) {
  const series = [
    { name: `Makan di Tempat (${currentLabel})`, data: dineInTrend },
    { name: `Bungkus (${currentLabel})`, data: takeawayTrend },
    { name: `Makan di Tempat (${previousLabel})`, data: dineInPreviousTrend },
    { name: `Bungkus (${previousLabel})`, data: takeawayPreviousTrend },
  ];

  const options: ApexCharts.ApexOptions = {
    chart: {
      type: "area",
      toolbar: { show: false },
      zoom: { enabled: false },
      fontFamily: "inherit",
      foreColor: "#737373",
      stacked: false,
    },
    stroke: {
      curve: "smooth",
      width: [2, 2, 2, 2],
      dashArray: [0, 0, 4, 4],
    },
    fill: {
      type: ["gradient", "gradient", "solid", "solid"],
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.1,
        stops: [0, 90, 100],
      },
      opacity: [0.8, 0.8, 0.2, 0.2],
    },
    colors: ["#10b981", "#f97316", "#0ea5e9", "#a855f7"],
    xaxis: {
      categories: labels,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: { colors: "#737373", fontSize: "10px" },
        hideOverlappingLabels: true,
      },
    },
    yaxis: {
      labels: {
        style: { colors: "#737373" },
        formatter: (val) => val.toFixed(0),
      },
    },
    dataLabels: { enabled: false },
    tooltip: {
      theme: "dark",
      y: { formatter: (val) => val + " Pesanan" },
    },
    legend: {
      position: "top",
      horizontalAlign: "left",
      labels: { colors: "#737373" },
    },
    grid: {
      borderColor: "#404040",
      strokeDashArray: 4,
    },
  };

  return (
    <div className="w-full border border-neutral-200 dark:border-neutral-700 rounded-2xl p-5 bg-white dark:bg-neutral-800">
      <div className="mb-6">
        <h3 className="text-lg font-extrabold dark:text-white mb-1">{title}</h3>
        <p className="text-xs dark:text-neutral-400 text-neutral-700 font-medium">
          {subtitle}
        </p>
      </div>
      <div className="w-full">
        <ReactApexChart
          options={options}
          series={series}
          type="area"
          height={320}
        />
      </div>
    </div>
  );
}
