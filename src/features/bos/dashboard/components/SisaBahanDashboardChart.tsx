"use client";

import dynamic from "next/dynamic";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

interface Props {
  data: { nama: string; sisa: number }[];
}

export default function SisaBahanDashboardChart({ data }: Props) {
  const series = [
    {
      name: "Sisa",
      data: data.map((d) => d.sisa),
    },
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
        horizontal: true,
        barHeight: "60%",
        borderRadius: 4,
      },
    },
    dataLabels: {
      enabled: true,
      style: {
        fontSize: "10px",
        colors: ["#fff"],
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
        style: { colors: "#737373", fontWeight: 600, fontSize: "11px" },
      },
    },
    colors: ["#f97316"], // Orange
    tooltip: {
      theme: "dark",
      y: { formatter: (val) => val + " Porsi" },
    },
    grid: {
      borderColor: "#404040",
      strokeDashArray: 4,
      xaxis: { lines: { show: true } },
      yaxis: { lines: { show: false } },
    },
  };

  const chartHeight = Math.max(200, data.length * 40 + 50);

  return (
    <div className="w-full mt-2 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-700 max-h-[300px] -ml-2">
      <div style={{ height: chartHeight }}>
        <ReactApexChart options={options} series={series} type="bar" height="100%" />
      </div>
    </div>
  );
}
