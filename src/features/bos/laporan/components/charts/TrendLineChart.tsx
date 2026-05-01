"use client";

import dynamic from "next/dynamic";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

interface Props {
  title: string;
  subtitle: string;
  labels: string[];
  currentData: number[];
  previousData: number[];
  currentLabel: string;
  previousLabel: string;
  yAxisFormatter?: (val: number) => string;
}

export default function TrendLineChart({
  title,
  subtitle,
  labels,
  currentData,
  previousData,
  currentLabel,
  previousLabel,
  yAxisFormatter = (val) => val.toString(),
}: Props) {
  const series = [
    { name: currentLabel, data: currentData },
    { name: previousLabel, data: previousData },
  ];

  const options: ApexCharts.ApexOptions = {
    chart: {
      type: "area",
      toolbar: { show: false },
      zoom: { enabled: false },
      fontFamily: "inherit",
      foreColor: "#737373",
    },
    stroke: {
      curve: "smooth",
      width: [3, 2],
      dashArray: [0, 4],
    },
    fill: {
      type: ["gradient", "solid"],
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.05,
        stops: [0, 90, 100],
      },
      opacity: [1, 0.1],
    },
    colors: ["#f97316", "#737373"],
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
        formatter: (val) => {
          if (val >= 1000000) return (val / 1000000).toFixed(1) + " Jt";
          if (val >= 1000) return (val / 1000).toFixed(0) + " Rb";
          return val.toString();
        },
      },
    },
    dataLabels: { enabled: false },
    tooltip: {
      theme: "dark",
      y: { formatter: yAxisFormatter },
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
