"use client";

import dynamic from "next/dynamic";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

const svgStyle = `display:inline;vertical-align:middle`;
const svgCalendar    = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="${svgStyle}"><rect width="18" height="18" x="3" y="4" rx="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/></svg>`;
const svgSun         = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="${svgStyle}"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>`;
const svgCloud        = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="${svgStyle}"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>`;
const svgCloudRain    = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="${svgStyle}"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M16 14v6"/><path d="M8 14v6"/><path d="M12 16v6"/></svg>`;
const svgCloudDrizzle = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#7dd3fc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="${svgStyle}"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M8 19v1"/><path d="M8 14v1"/><path d="M16 19v1"/><path d="M16 14v1"/><path d="M12 21v1"/><path d="M12 16v1"/></svg>`;
const svgXCircle      = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#f87171" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="${svgStyle}"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>`;
const svgCheckCircle  = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="${svgStyle}"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>`;

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
  showComparison?: boolean;
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
  showComparison,
}: Props) {
  const series = [{ name: currentLabel, data: currentData }];
  if (showComparison !== false) {
    series.push({ name: previousLabel, data: previousData });
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
      custom: function ({
        series,
        dataPointIndex,
        w,
      }: {
        series: number[][];
        dataPointIndex: number;
        w: { globals: { labels: string[] } };
      }) {
        const valCurrent = series[0][dataPointIndex];
        const valPrevious =
          series.length > 1 ? series[1][dataPointIndex] : null;
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
          if (w.toLowerCase() === "hujan") return `${svgCloudRain} Hujan`;
          if (w.toLowerCase() === "mendung") return `${svgCloud} Mendung`;
          return `${svgSun} Cerah`;
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
                let icon = svgSun;
                if (g.weather.toLowerCase().includes("hujan")) icon = svgCloudRain;
                else if (g.weather.toLowerCase().includes("gerimis")) icon = svgCloudDrizzle;
                else if (g.weather.toLowerCase().includes("mendung")) icon = svgCloud;
                return `<span style="background:#262626; padding:1px 4px; border-radius:4px; font-size:10px; border:1px solid #404040;">${icon} ${g.start}-${g.end}</span>`;
              })
              .join("") +
            "</div>"
          );
        };

        return `
          <div style="padding: 12px; font-family: inherit; background: #171717; color: white; border: 1px solid #404040; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            <div style="font-weight: 900; font-size: 13px; margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px solid #404040;">
              ${svgCalendar} ${label}
            </div>
            
            <div style="margin-bottom: 10px;">
              <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
                <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #2563eb;"></span>
                <span style="font-weight: 800; font-size: 12px;">${currentLabel}:</span>
                <span style="font-weight: bold; font-size: 12px; color: #60a5fa;">${yAxisFormatter(valCurrent)}</span>
              </div>
              <div style="font-size: 11px; color: #a3a3a3; padding-left: 16px;">
                Cuaca: ${renderWeatherSequence(wLogsCurr, wCurr)}
                <div style="margin-top: 4px;">Status: ${liburCurr ? `${svgXCircle} Tutup <span style="font-size: 10px; color: #f87171;">(${alasanCurr})</span>` : `${svgCheckCircle} Buka`}</div>
              </div>
            </div>
            
            ${
              series.length > 1
                ? `
            <div>
              <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
                <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #52525b;"></span>
                <span style="font-weight: 800; font-size: 12px;">${previousLabel}:</span>
                <span style="font-weight: bold; font-size: 12px; color: #d4d4d4;">${yAxisFormatter(valPrevious!)}</span>
              </div>
              <div style="font-size: 11px; color: #a3a3a3; padding-left: 16px;">
                Cuaca: ${renderWeatherSequence(wLogsPrev, wPrev)}
                <div style="margin-top: 4px;">Status: ${liburPrev ? `${svgXCircle} Tutup <span style="font-size: 10px; color: #f87171;">(${alasanPrev})</span>` : `${svgCheckCircle} Buka`}</div>
              </div>
            </div>
            `
                : ""
            }
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
