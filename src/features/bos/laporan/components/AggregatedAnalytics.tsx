"use client";

import { AggregatedData } from "@/interfaces/models";
import TrendLineChart from "./charts/TrendLineChart";
import ComparisonBarChart from "./charts/ComparisonBarChart";
import OrderTypeChart from "./charts/OrderTypeChart";
import OrderTypeTimelineChart from "./charts/OrderTypeTimelineChart";
import SisaBahanChart from "./charts/SisaBahanChart";
import WeatherSummaryCard from "./WeatherSummaryCard";

import SummaryCards from "./SummaryCards";

interface Props {
  data: AggregatedData;
  titleSuffix: string;
  intervalName: string;
}

export default function AggregatedAnalytics({
  data,
  titleSuffix,
  intervalName,
}: Props) {
  const showComparison =
    data.totalRevenuePrevious > 0 || data.totalPortionPrevious > 0;
  return (
    <div className="flex flex-col gap-5 pb-6">
      <SummaryCards
        currentRevenue={data.totalRevenueCurrent}
        previousRevenue={data.totalRevenuePrevious}
        currentPortion={data.totalPortionCurrent}
        previousPortion={data.totalPortionPrevious}
      />

      {(data.totalLiburCurrent! > 0 || data.totalLiburPrevious! > 0) && (
        <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-4 rounded-xl">
          <p className="text-[10px] uppercase font-black tracking-widest text-neutral-400 mb-2">
            Informasi Hari Libur
          </p>
          <div className="flex flex-col gap-2">
            {data.totalLiburCurrent! > 0 && (
              <div>
                <p className="text-sm font-bold text-neutral-800 dark:text-white">
                  {data.timeLabel}: Libur {data.totalLiburCurrent} Hari
                </p>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Alasan: {data.alasanLiburCurrentList?.join(", ")}
                </p>
              </div>
            )}
            {data.totalLiburPrevious! > 0 && (
              <div
                className={
                  data.totalLiburCurrent! > 0
                    ? "pt-2 border-t border-neutral-100 dark:border-neutral-700"
                    : ""
                }
              >
                <p className="text-sm font-bold text-neutral-800 dark:text-white">
                  {data.prevTimeLabel}: Libur {data.totalLiburPrevious} Hari
                </p>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Alasan: {data.alasanLiburPreviousList?.join(", ")}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <TrendLineChart
        title={`Pendapatan ${titleSuffix}`}
        subtitle={`Tren pendapatan per ${intervalName.toLowerCase()} ${data.timeLabel} vs ${data.prevTimeLabel}`}
        labels={data.labels}
        currentData={data.revenueCurrentTrend}
        previousData={data.revenuePreviousTrend}
        currentLabel={data.timeLabel}
        previousLabel={data.prevTimeLabel}
        weatherCurrentTrend={data.weatherCurrentTrend}
        weatherPreviousTrend={data.weatherPreviousTrend}
        weatherLogsCurrentTrend={data.weatherLogsCurrentTrend}
        weatherLogsPreviousTrend={data.weatherLogsPreviousTrend}
        isLiburCurrentTrend={data.isLiburCurrentTrend}
        isLiburPreviousTrend={data.isLiburPreviousTrend}
        alasanLiburCurrentTrend={data.alasanLiburCurrentTrend}
        alasanLiburPreviousTrend={data.alasanLiburPreviousTrend}
        showComparison={showComparison}
        yAxisFormatter={(val) =>
          new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0,
          }).format(val)
        }
      />

      <ComparisonBarChart
        title={`Penjualan Porsi ${titleSuffix}`}
        subtitle={`Perbandingan jumlah porsi per ${intervalName.toLowerCase()}`}
        labels={data.labels}
        currentData={data.portionCurrentTrend}
        previousData={data.portionPreviousTrend}
        currentLabel={data.timeLabel}
        previousLabel={data.prevTimeLabel}
        yAxisFormatter={(val) => val + " Porsi"}
        weatherCurrentTrend={data.weatherCurrentTrend}
        weatherPreviousTrend={data.weatherPreviousTrend}
        weatherLogsCurrentTrend={data.weatherLogsCurrentTrend}
        weatherLogsPreviousTrend={data.weatherLogsPreviousTrend}
        isLiburCurrentTrend={data.isLiburCurrentTrend}
        isLiburPreviousTrend={data.isLiburPreviousTrend}
        alasanLiburCurrentTrend={data.alasanLiburCurrentTrend}
        alasanLiburPreviousTrend={data.alasanLiburPreviousTrend}
        showComparison={showComparison}
      />

      <OrderTypeTimelineChart
        title="Rata-rata Tren Pesanan Per Jam"
        subtitle={`Rata-rata persebaran jam makan pada ${data.timeLabel} vs ${data.prevTimeLabel}`}
        labels={data.hourlyLabels || []}
        currentLabel={data.timeLabel}
        previousLabel={data.prevTimeLabel}
        dineInTrend={data.dineInHourlyAvg || []}
        takeawayTrend={data.takeawayHourlyAvg || []}
        dineInPreviousTrend={data.dineInPreviousHourlyAvg || []}
        takeawayPreviousTrend={data.takeawayPreviousHourlyAvg || []}
        showComparison={showComparison}
      />

      <OrderTypeChart
        title="Total Tipe Pesanan"
        subtitle={`Makan di Tempat vs Bungkus`}
        currentLabel={data.timeLabel}
        previousLabel={data.prevTimeLabel}
        dineInCurrent={data.dineInCurrent}
        takeawayCurrent={data.takeawayCurrent}
        dineInPrevious={data.dineInPrevious}
        takeawayPrevious={data.takeawayPrevious}
        showComparison={showComparison}
      />

      <WeatherSummaryCard
        currentData={data.cuacaCurrent}
        previousData={data.cuacaPrevious}
        currentBreakdown={data.cuacaCurrentBreakdown}
        previousBreakdown={data.cuacaPreviousBreakdown}
        currentLabel={data.timeLabel}
        previousLabel={data.prevTimeLabel}
        showComparison={showComparison}
        isDaily={false}
        intervalName={intervalName}
      />

      <SisaBahanChart
        data={data.sisaBahan}
        currentLabel={data.timeLabel}
        previousLabel={data.prevTimeLabel}
        showComparison={showComparison}
      />
    </div>
  );
}
