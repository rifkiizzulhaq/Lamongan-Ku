"use client";

import dynamic from "next/dynamic";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

interface Props {
  title: string;
  subtitle: string;
  currentLabel: string;
  previousLabel: string;
  dineInCurrent: number;
  takeawayCurrent: number;
  dineInPrevious: number;
  takeawayPrevious: number;
  showComparison?: boolean;
}

export default function OrderTypeChart({
  title,
  subtitle,
  currentLabel,
  previousLabel,
  dineInCurrent,
  takeawayCurrent,
  dineInPrevious,
  takeawayPrevious,
  showComparison,
}: Props) {
  const series = [
    {
      name: `Makan di Tempat (${currentLabel})`,
      data: [dineInCurrent],
    },
    {
      name: `Bungkus (${currentLabel})`,
      data: [takeawayCurrent],
    },
  ];

  if (showComparison !== false) {
    series.push(
      {
        name: `Makan di Tempat (${previousLabel})`,
        data: [dineInPrevious],
      },
      {
        name: `Bungkus (${previousLabel})`,
        data: [takeawayPrevious],
      },
    );
  }

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
        barHeight: "50%",
        borderRadius: 4,
      },
    },
    dataLabels: {
      enabled: true,
      style: {
        fontSize: "12px",
        colors: ["#fff"],
      },
      formatter: (val) => val.toString(),
    },
    stroke: { show: true, width: 1, colors: ["transparent"] },
    xaxis: {
      categories: [""],
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { show: false },
    },
    yaxis: {
      labels: {
        style: { colors: "#737373", fontWeight: 600, fontSize: "12px" },
      },
    },
    colors: ["#10b981", "#34d399", "#52525b", "#71717a"],
    tooltip: {
      theme: "dark",
      y: { formatter: (val) => val + " Pesanan" },
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

  return (
    <div className="w-full border border-neutral-200 dark:border-neutral-700 rounded-2xl p-5 bg-white dark:bg-neutral-800">
      <div className="mb-4">
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
          height={220}
        />
      </div>
    </div>
  );
}
