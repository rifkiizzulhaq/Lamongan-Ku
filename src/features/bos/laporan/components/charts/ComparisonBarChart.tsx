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

export default function ComparisonBarChart({
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
      type: "bar",
      toolbar: { show: false },
      zoom: { enabled: false },
      fontFamily: "inherit",
      foreColor: "#737373",
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "55%",
        borderRadius: 4,
      },
    },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 2, colors: ["transparent"] },
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
          if (val >= 1000) return (val / 1000).toFixed(1) + "k";
          return val.toString();
        },
      },
    },
    fill: { opacity: 1 },
    colors: ["#2563eb", "#52525b"],
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
          type="bar"
          height={320}
        />
      </div>
    </div>
  );
}
