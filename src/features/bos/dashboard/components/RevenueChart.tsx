"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getRevenueChartData } from "@/src/server/bos/dashboard/dashboard.server";
import { useSupabaseRealtime } from "@/src/hooks/useSupabaseRealtime";
import { LuLoader } from "react-icons/lu";

const svgShoppingBag = `<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`;
const svgMapPin = `<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`;

interface TooltipDataPoint {
  x: number;
  y: number;
  details?: Record<string, number>;
  takeawayItems?: Record<string, number>;
  tables?: string[];
  customerTypes?: string[];
}

interface TooltipSeries {
  name: string;
  data: TooltipDataPoint[];
}

interface TooltipContext {
  config: {
    series: TooltipSeries[];
    colors: string[];
  };
}

interface TooltipParams {
  series: number[][];
  dataPointIndex: number;
  w: TooltipContext;
}

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

  const { series, categories, tooltipData } = useMemo(() => {
    const sortedData = [...chartData].sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );

    if (sortedData.length === 0) return { series: [], categories: [] };

    const bungkusMap: Record<
      number,
      { qty: number; items: Record<string, number>; tables: Set<string> }
    > = {};
    const makanSiniMap: Record<
      number,
      {
        qty: number;
        items: Record<string, number>;
        takeawayItems: Record<string, number>;
        tables: Set<string>;
        customerTypes: Set<string>;
      }
    > = {};

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
        if (!bungkusMap[key])
          bungkusMap[key] = { qty: 0, items: {}, tables: new Set() };
        bungkusMap[key].qty += p.qty;
        if (p.menuName) {
          bungkusMap[key].items[p.menuName] =
            (bungkusMap[key].items[p.menuName] || 0) + p.qty;
        }
        if (p.tableName) {
          bungkusMap[key].tables.add(p.tableName);
        }
      } else {
        if (!makanSiniMap[key])
          makanSiniMap[key] = {
            qty: 0,
            items: {},
            takeawayItems: {},
            tables: new Set(),
            customerTypes: new Set(),
          };
        makanSiniMap[key].qty += p.qty;
        if (p.menuName) {
          if (p.isTakeaway) {
            makanSiniMap[key].takeawayItems[p.menuName] =
              (makanSiniMap[key].takeawayItems[p.menuName] || 0) + p.qty;
          } else {
            makanSiniMap[key].items[p.menuName] =
              (makanSiniMap[key].items[p.menuName] || 0) + p.qty;
          }
        }
        if (p.tableName) {
          makanSiniMap[key].tables.add(p.tableName);
        }
        if (p.customerType && p.customerType !== "-") {
          makanSiniMap[key].customerTypes.add(p.customerType);
        }
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

    const tooltipData = {
      details: [
        allMinutes.map((mins) => bungkusMap[mins]?.items || {}),
        allMinutes.map((mins) => makanSiniMap[mins]?.items || {}),
      ] as Record<string, number>[][],
      takeaway: [
        allMinutes.map(() => ({}) as Record<string, number>),
        allMinutes.map((mins) => makanSiniMap[mins]?.takeawayItems || {}),
      ] as Record<string, number>[][],
      tables: [
        allMinutes.map((mins) =>
          bungkusMap[mins]?.tables ? Array.from(bungkusMap[mins].tables) : [],
        ),
        allMinutes.map((mins) =>
          makanSiniMap[mins]?.tables
            ? Array.from(makanSiniMap[mins].tables)
            : [],
        ),
      ] as string[][][],
      customerTypes: [
        allMinutes.map(() => []),
        allMinutes.map((mins) =>
          makanSiniMap[mins]?.customerTypes
            ? Array.from(makanSiniMap[mins].customerTypes)
            : [],
        ),
      ] as string[][][],
    };

    return {
      categories: allMinutes.map(minutesToLabel),
      tooltipData,
      series: [
        {
          name: "Bungkus",
          data: allMinutes.map((mins) => bungkusMap[mins]?.qty || 0),
        },
        {
          name: "Makan Sini",
          data: allMinutes.map((mins) => makanSiniMap[mins]?.qty || 0),
        },
      ],
    };
  }, [chartData]);

  const options = useMemo(
    (): ApexCharts.ApexOptions => ({
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
          columnWidth: "60%",
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
        categories,
        labels: {
          style: { colors: "#a3a3a3", fontSize: "9px", fontWeight: 700 },
          rotate: -45,
          rotateAlways: true,
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
        custom: function ({ series, dataPointIndex, w }: TooltipParams) {
          const category = categories[dataPointIndex];
          let html = `<div class="bg-neutral-900 border border-neutral-700 shadow-xl text-white min-w-40 rounded-lg overflow-hidden flex flex-col pointer-events-auto" style="pointer-events: auto; max-height: 250px;">`;
          html += `<div class="font-bold text-xs p-3 pb-2 border-b border-neutral-700 bg-neutral-900 shrink-0 z-10 shadow-sm">Jam ${category}</div>`;
          html += `<div class="p-3 pt-2 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-700 overscroll-contain" onwheel="event.stopPropagation()" ontouchmove="event.stopPropagation()">`;

          let hasData = false;

          w.config.series.forEach((s: TooltipSeries, idx: number) => {
            const val = series[idx][dataPointIndex];
            if (!val || val === 0) return;
            hasData = true;

            const color = w.config.colors[idx];
            html += `<div class="mb-2 last:mb-0">`;
            html += `<div class="flex items-center gap-1.5 font-bold text-xs mb-1">`;
            html += `<span class="w-2 h-2 rounded-full inline-block shrink-0" style="background-color: ${color}"></span>`;
            html += `<span>${s.name}: ${val} Porsi</span>`;
            html += `</div>`;

            const details = tooltipData?.details[idx]?.[dataPointIndex];
            if (details && Object.keys(details).length > 0) {
              html += `<div class="pl-3.5 flex flex-col gap-0.5 text-[10px] text-neutral-300">`;
              Object.entries(details).forEach(([name, q]) => {
                html += `<div>• ${name} <span class="font-bold text-white ml-0.5">x${q}</span></div>`;
              });
              html += `</div>`;
            }

            const takeawayItems = tooltipData?.takeaway[idx]?.[dataPointIndex];
            if (takeawayItems && Object.keys(takeawayItems).length > 0) {
              html += `<div class="pl-3.5 mt-1.5 flex flex-col gap-0.5">`;
              html += `<div class="text-[10px] font-bold text-orange-400 mb-0.5">${svgShoppingBag} Bungkus:</div>`;
              Object.entries(takeawayItems).forEach(([name, q]) => {
                html += `<div class="text-[10px] text-neutral-300 pl-2">• ${name} <span class="font-bold text-white ml-0.5">x${q}</span></div>`;
              });
              html += `</div>`;
            }

            const cTypes =
              tooltipData?.customerTypes?.[idx]?.[dataPointIndex] ?? [];
            if (cTypes.length > 0) {
              html += `<div class="pl-3.5 mt-1.5 text-[10px] text-neutral-400">Tipe Pelanggan: <span class="text-neutral-200 font-bold capitalize">${cTypes.join(", ")}</span></div>`;
            }

            const tables = tooltipData?.tables[idx]?.[dataPointIndex] ?? [];
            if (tables.length > 0) {
              html += `<div class="pl-3.5 mt-1 text-[10px] text-neutral-400">${svgMapPin} Meja: <span class="text-neutral-200 font-bold">${tables.join(", ")}</span></div>`;
            }
            html += `</div>`;
          });

          html += `</div>`;
          html += `</div>`;
          return hasData ? html : "";
        },
      },
      colors: ["#f97316", "#2563eb"],
      legend: {
        position: "top",
        horizontalAlign: "left",
        labels: { colors: "#a3a3a3" },
        markers: { size: 8 },
        itemMargin: { horizontal: 15, vertical: 5 },
      },
      grid: {
        borderColor: "#333333",
        strokeDashArray: 4,
        padding: { left: 10, right: 10 },
      },
    }),
    [categories, tooltipData],
  );

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
