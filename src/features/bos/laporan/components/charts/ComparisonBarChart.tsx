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
  weatherCurrentTrend?: string[];
  weatherPreviousTrend?: string[];
  weatherLogsCurrentTrend?: { timeRange: string; weather: string }[][];
  weatherLogsPreviousTrend?: { timeRange: string; weather: string }[][];
  isLiburCurrentTrend?: boolean[];
  isLiburPreviousTrend?: boolean[];
  alasanLiburCurrentTrend?: string[];
  alasanLiburPreviousTrend?: string[];
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
  weatherCurrentTrend,
  weatherPreviousTrend,
  weatherLogsCurrentTrend,
  weatherLogsPreviousTrend,
  isLiburCurrentTrend,
  isLiburPreviousTrend,
  alasanLiburCurrentTrend,
  alasanLiburPreviousTrend,
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
      custom: function ({ series, dataPointIndex, w }: { series: number[][]; dataPointIndex: number; w: { globals: { labels: string[] } } }) {
        const valCurrent = series[0][dataPointIndex];
        const valPrevious = series[1][dataPointIndex];
        const label = w.globals.labels[dataPointIndex];

        const wCurr = weatherCurrentTrend?.[dataPointIndex] || "";
        const wPrev = weatherPreviousTrend?.[dataPointIndex] || "";

        const liburCurr = isLiburCurrentTrend?.[dataPointIndex];
        const alasanCurr = alasanLiburCurrentTrend?.[dataPointIndex] || "";
        const liburPrev = isLiburPreviousTrend?.[dataPointIndex];
        const alasanPrev = alasanLiburPreviousTrend?.[dataPointIndex] || "";

        const wLogsCurr = weatherLogsCurrentTrend?.[dataPointIndex] || [];
        const wLogsPrev = weatherLogsPreviousTrend?.[dataPointIndex] || [];

        const formatW = (w: string) => {
          if (!w) return "-";
          if (w.toLowerCase() === "hujan") return "🌧️ Hujan";
          if (w.toLowerCase() === "mendung") return "☁️ Mendung";
          return "☀️ Cerah";
        };

        const renderWeatherSequence = (
          logs: { timeRange: string; weather: string }[],
          dom: string,
        ) => {
          if (logs.length === 0) return formatW(dom);
          const grouped = [];
          let current = {
            weather: logs[0].weather,
            start: logs[0].timeRange.split("-")[0],
            end: logs[0].timeRange.split("-")[1],
          };
          for (let i = 1; i < logs.length; i++) {
            if (logs[i].weather === current.weather) {
              current.end = logs[i].timeRange.split("-")[1];
            } else {
              grouped.push(current);
              current = {
                weather: logs[i].weather,
                start: logs[i].timeRange.split("-")[0],
                end: logs[i].timeRange.split("-")[1],
              };
            }
          }
          grouped.push(current);

          return (
            "<div style='display:flex; flex-wrap:wrap; gap:4px; margin-top:2px;'>" +
            grouped
              .map((g) => {
                let icon = "☀️";
                if (g.weather.toLowerCase().includes("hujan")) icon = "🌧️";
                else if (g.weather.toLowerCase().includes("gerimis"))
                  icon = "🌦️";
                else if (g.weather.toLowerCase().includes("mendung"))
                  icon = "☁️";
                return `<span style="background:#262626; padding:1px 4px; border-radius:4px; font-size:10px; border:1px solid #404040;">${icon} ${g.start}-${g.end}</span>`;
              })
              .join("") +
            "</div>"
          );
        };

        return `
          <div style="padding: 12px; font-family: inherit; background: #171717; color: white; border: 1px solid #404040; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            <div style="font-weight: 900; font-size: 13px; margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px solid #404040;">
              📅 ${label}
            </div>
            
            <div style="margin-bottom: 10px;">
              <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
                <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #2563eb;"></span>
                <span style="font-weight: 800; font-size: 12px;">${currentLabel}:</span>
                <span style="font-weight: bold; font-size: 12px; color: #60a5fa;">${yAxisFormatter(valCurrent)}</span>
              </div>
              <div style="font-size: 11px; color: #a3a3a3; padding-left: 16px;">
                Cuaca: ${renderWeatherSequence(wLogsCurr, wCurr)}
                <div style="margin-top: 4px;">Status: ${liburCurr ? `⛔ Tutup <span style="font-size: 10px; color: #f87171;">(${alasanCurr})</span>` : "🟢 Buka"}</div>
              </div>
            </div>
            
            <div>
              <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
                <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #52525b;"></span>
                <span style="font-weight: 800; font-size: 12px;">${previousLabel}:</span>
                <span style="font-weight: bold; font-size: 12px; color: #d4d4d4;">${yAxisFormatter(valPrevious)}</span>
              </div>
              <div style="font-size: 11px; color: #a3a3a3; padding-left: 16px;">
                Cuaca: ${renderWeatherSequence(wLogsPrev, wPrev)}
                <div style="margin-top: 4px;">Status: ${liburPrev ? `⛔ Tutup <span style="font-size: 10px; color: #f87171;">(${alasanPrev})</span>` : "🟢 Buka"}</div>
              </div>
            </div>
          </div>
        `;
      },
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
