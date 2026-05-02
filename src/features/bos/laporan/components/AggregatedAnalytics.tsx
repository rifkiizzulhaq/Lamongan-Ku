"use client";

import { AggregatedData } from "../data/mockData";
import TrendLineChart from "./charts/TrendLineChart";
import ComparisonBarChart from "./charts/ComparisonBarChart";
import OrderTypeChart from "./charts/OrderTypeChart";
import OrderTypeTimelineChart from "./charts/OrderTypeTimelineChart";
import SisaBahanChart from "./charts/SisaBahanChart";
import WeatherSummaryCard from "./WeatherSummaryCard";

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
  return (
    <div className="flex flex-col gap-5 pb-6">
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-4 rounded-xl">
          <p className="text-[10px] uppercase font-black tracking-widest text-neutral-400">
            Total Pendapatan
          </p>
          <p className="text-xl font-black text-neutral-800 dark:text-white mt-1">
            Rp {(data.totalRevenueCurrent / 1000000).toFixed(1)} Jt
          </p>
          <p className="text-xs font-bold mt-1 text-neutral-500">
            vs Rp {(data.totalRevenuePrevious / 1000000).toFixed(1)} Jt
          </p>
        </div>
        <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-4 rounded-xl">
          <p className="text-[10px] uppercase font-black tracking-widest text-neutral-400">
            Total Porsi
          </p>
          <p className="text-xl font-black text-neutral-800 dark:text-white mt-1">
            {(data.totalPortionCurrent / 1000).toFixed(1)}k Porsi
          </p>
          <p className="text-xs font-bold mt-1 text-neutral-500">
            vs {(data.totalPortionPrevious / 1000).toFixed(1)}k Porsi
          </p>
        </div>
      </div>

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
      />


      <WeatherSummaryCard
        currentData={data.cuacaCurrent}
        previousData={data.cuacaPrevious}
        currentLabel={data.timeLabel}
        previousLabel={data.prevTimeLabel}
        isDaily={false}
      />

      <SisaBahanChart
        data={data.sisaBahan}
        currentLabel={data.timeLabel}
        previousLabel={data.prevTimeLabel}
      />
    </div>
  );
}
