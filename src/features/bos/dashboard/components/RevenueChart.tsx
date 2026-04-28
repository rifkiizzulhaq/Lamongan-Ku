"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

const generateCategories = (openHour: number, closeHour: number) => {
  const categories = [];
  let current = openHour;
  while (true) {
    categories.push(`${current.toString().padStart(2, "0")}:00`);
    if (current === closeHour) break;
    current = (current + 1) % 24;
  }
  return categories;
};

export default function RevenueChart() {
  const jamBuka = 17; 
  const jamTutup = 2; 
  const categories = useMemo(() => generateCategories(jamBuka, jamTutup), []);

  const dummyPesanan = useMemo(() => [
    { type: "Makan Sini", qty: 2, created_at: "2026-04-28T17:15:00" },
    { type: "Makan Sini", qty: 4, created_at: "2026-04-28T17:45:00" },
    { type: "Bungkus", qty: 3, created_at: "2026-04-28T18:10:00" }, 
    { type: "Makan Sini", qty: 10, created_at: "2026-04-28T19:30:00" },
    { type: "Bungkus", qty: 5, created_at: "2026-04-28T19:55:00" },
    { type: "Makan Sini", qty: 15, created_at: "2026-04-28T20:15:00" }, 
    { type: "Bungkus", qty: 8, created_at: "2026-04-28T20:45:00" },
    { type: "Makan Sini", qty: 5, created_at: "2026-04-29T00:15:00" },
    { type: "Makan Sini", qty: 2, created_at: "2026-04-29T01:30:00" },
  ], []);

  const series = useMemo(() => {
    const bungkusData = new Array(categories.length).fill(0);
    const makanSiniData = new Array(categories.length).fill(0);

    dummyPesanan.forEach((pesanan) => {
      const jam = new Date(pesanan.created_at).getHours();
      const labelJam = `${jam.toString().padStart(2, "0")}:00`;

      const index = categories.indexOf(labelJam);

      if (index !== -1) {
        if (pesanan.type === "Bungkus") {
          bungkusData[index] += pesanan.qty;
        } else {
          makanSiniData[index] += pesanan.qty;
        }
      }
    });

    return [
      { name: "Bungkus", data: bungkusData },
      { name: "Makan Sini", data: makanSiniData },
    ];
  }, [categories, dummyPesanan]);

  const options: ApexCharts.ApexOptions = {
    chart: {
      type: "bar",
      height: 350,
      toolbar: { show: false },
      fontFamily: "inherit",
      foreColor: "#a3a3a3",
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "50%",
        borderRadius: 4,
      },
    },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 2, colors: ["transparent"] },
    xaxis: {
      categories: categories, 
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: { colors: "#a3a3a3", fontSize: "10px" },
        hideOverlappingLabels: true, 
      },
    },
    yaxis: {
      title: { text: "Porsi Terjual", style: { fontWeight: 600, color: "#a3a3a3" } },
      labels: { style: { colors: "#a3a3a3" } },
    },
    fill: { opacity: 1 },
    tooltip: {
      theme: "dark",
      y: { formatter: (val) => val + " Porsi" },
    },
    colors: ["#f97316", "#2563eb"],
    legend: {
      position: "top",
      horizontalAlign: "left",
      labels: { colors: "#fffff" },
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
            Perbandingan Porsi Terjual Harian (per Jam)
          </p>
        </div>
      </div>
      <div id="chart" className="w-full">
        {series.length > 0 && (
          <ReactApexChart options={options} series={series} type="bar" height={320} />
        )}
      </div>
    </div>
  );
}