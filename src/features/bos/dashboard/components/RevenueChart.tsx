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

interface OrderDetail {
  orderId: number;
  items: Record<string, number>;
  takeawayItems: Record<string, number>;
  tableName: string | null;
  customerType: string;
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
      { qty: number; orders: Record<number, OrderDetail> }
    > = {};
    const makanSiniMap: Record<
      number,
      { qty: number; orders: Record<number, OrderDetail> }
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
      const orderId = p.orderId;

      if (p.type === "Bungkus") {
        if (!bungkusMap[key]) bungkusMap[key] = { qty: 0, orders: {} };
        bungkusMap[key].qty += p.qty;

        if (!bungkusMap[key].orders[orderId]) {
          bungkusMap[key].orders[orderId] = {
            orderId,
            items: {},
            takeawayItems: {},
            tableName: p.tableName,
            customerType: p.customerType,
          };
        }

        if (p.menuName) {
          bungkusMap[key].orders[orderId].items[p.menuName] =
            (bungkusMap[key].orders[orderId].items[p.menuName] || 0) + p.qty;
        }
      } else {
        if (!makanSiniMap[key]) makanSiniMap[key] = { qty: 0, orders: {} };
        makanSiniMap[key].qty += p.qty;

        if (!makanSiniMap[key].orders[orderId]) {
          makanSiniMap[key].orders[orderId] = {
            orderId,
            items: {},
            takeawayItems: {},
            tableName: p.tableName,
            customerType: p.customerType,
          };
        }

        if (p.menuName) {
          if (p.isTakeaway) {
            makanSiniMap[key].orders[orderId].takeawayItems[p.menuName] =
              (makanSiniMap[key].orders[orderId].takeawayItems[p.menuName] ||
                0) + p.qty;
          } else {
            makanSiniMap[key].orders[orderId].items[p.menuName] =
              (makanSiniMap[key].orders[orderId].items[p.menuName] || 0) +
              p.qty;
          }
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
      orders: [
        allMinutes.map((mins) => Object.values(bungkusMap[mins]?.orders || {})),
        allMinutes.map((mins) =>
          Object.values(makanSiniMap[mins]?.orders || {}),
        ),
      ],
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
          style: { fontWeight: 800, color: "#22C55E" },
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

            const minuteOrders =
              tooltipData?.orders?.[idx]?.[dataPointIndex] || [];

            minuteOrders.forEach((order: OrderDetail, orderIndex: number) => {
              if (minuteOrders.length > 1) {
                html += `<div class="text-[10px] font-black text-neutral-500 uppercase tracking-widest pl-3.5 mb-1 mt-2 border-t border-neutral-700/50 pt-2 first:mt-0 first:border-0 first:pt-0">Pesanan ${orderIndex + 1}</div>`;
              }

              if (order.items && Object.keys(order.items).length > 0) {
                html += `<div class="pl-4 flex flex-col gap-0.5 text-[10px] text-neutral-300">`;
                Object.entries(order.items).forEach(([name, q]) => {
                  html += `<div>• ${name} <span class="font-bold text-white ml-0.5">x${q}</span></div>`;
                });
                html += `</div>`;
              }

              if (
                order.takeawayItems &&
                Object.keys(order.takeawayItems).length > 0
              ) {
                html += `<div class="pl-4 mt-1.5 flex flex-col gap-0.5">`;
                html += `<div class="text-[10px] font-bold text-orange-400 mb-0.5">${svgShoppingBag} Bungkus:</div>`;
                Object.entries(order.takeawayItems).forEach(([name, q]) => {
                  html += `<div class="text-[10px] text-neutral-300 pl-2">• ${name} <span class="font-bold text-white ml-0.5">x${q}</span></div>`;
                });
                html += `</div>`;
              }

              if (order.customerType && order.customerType !== "-") {
                html += `<div class="pl-4 mt-1.5 text-[10px] text-neutral-400">Tipe Pelanggan: <span class="text-neutral-200 font-bold capitalize">${order.customerType}</span></div>`;
              }

              if (order.tableName) {
                html += `<div class="pl-4 mt-1 text-[10px] text-neutral-400">${svgMapPin} Meja: <span class="text-neutral-200 font-bold">${order.tableName}</span></div>`;
              }
            });
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
