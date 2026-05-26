"use client";

import { DailyData } from "@/interfaces/laporan";
import TrendLineChart from "./charts/TrendLineChart";
import OrderTypeChart from "./charts/OrderTypeChart";
import OrderTypeTimelineChart from "./charts/OrderTypeTimelineChart";
import WeatherSummaryCard from "./WeatherSummaryCard";
import SummaryCards from "./SummaryCards";
import { LuInfo } from "react-icons/lu";

interface Props {
  data: DailyData;
}

export default function DailyAnalytics({ data }: Props) {
  const showComparison =
    data.totalRevenuePrevious > 0 || data.portionPrevious > 0;
  return (
    <div className="flex flex-col gap-5 pb-6">
      {data.isLiburCurrent && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 p-4 rounded-xl flex gap-3 items-start">
          <LuInfo className="shrink-0 mt-0.5" size={18} />
          <div>
            <p className="font-bold text-sm">
              Warung Libur Pada {data.timeLabel}
            </p>
            <p className="text-xs mt-1">
              {data.alasanLiburCurrent || "Tidak ada alasan spesifik."}
            </p>
          </div>
        </div>
      )}

      {data.isLiburPrevious && showComparison && (
        <div className="bg-orange/10 border border-orange/20 text-orange p-4 rounded-xl flex gap-3 items-start">
          <LuInfo className="shrink-0 mt-0.5" size={18} />
          <div>
            <p className="font-bold text-sm">
              Warung Libur Pada {data.prevTimeLabel}
            </p>
            <p className="text-xs mt-1">
              Data perbandingan ({data.prevTimeLabel}) menunjukkan angka 0
              karena warung sedang libur. Alasan:{" "}
              {data.alasanLiburPrevious || "Tidak ada alasan spesifik."}
            </p>
          </div>
        </div>
      )}

      <SummaryCards
        currentRevenue={data.totalRevenueCurrent}
        previousRevenue={data.totalRevenuePrevious}
        currentPortion={data.portionCurrent}
        previousPortion={data.portionPrevious}
      />

      <TrendLineChart
        title="Pendapatan (Harian)"
        subtitle={
          showComparison
            ? `Perbandingan pendapatan per jam ${data.timeLabel} vs ${data.prevTimeLabel}`
            : `Pendapatan per jam ${data.timeLabel}`
        }
        labels={data.revenueLabels}
        currentData={data.revenueCurrent}
        previousData={data.revenuePrevious}
        currentLabel={data.timeLabel}
        previousLabel={data.prevTimeLabel}
        showComparison={showComparison}
        weatherCurrentTrend={data.cuacaCurrent}
        weatherPreviousTrend={data.cuacaPrevious}
        yAxisFormatter={(val) =>
          new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0,
          }).format(val)
        }
      />

      <OrderTypeTimelineChart
        title="Tren Pesanan Per Jam"
        subtitle={
          showComparison
            ? `Perbandingan Makan di Tempat vs Bungkus pada ${data.timeLabel} vs ${data.prevTimeLabel}`
            : `Makan di Tempat vs Bungkus pada ${data.timeLabel}`
        }
        labels={data.revenueLabels}
        currentLabel={data.timeLabel}
        previousLabel={data.prevTimeLabel}
        showComparison={showComparison}
        dineInTrend={data.dineInTrend || []}
        takeawayTrend={data.takeawayTrend || []}
        dineInPreviousTrend={data.dineInPreviousTrend || []}
        takeawayPreviousTrend={data.takeawayPreviousTrend || []}
      />

      <OrderTypeChart
        title="Total Tipe Pesanan"
        subtitle={
          showComparison
            ? `Makan di Tempat vs Bungkus pada ${data.timeLabel} vs ${data.prevTimeLabel}`
            : `Makan di Tempat vs Bungkus pada ${data.timeLabel}`
        }
        currentLabel={data.timeLabel}
        previousLabel={data.prevTimeLabel}
        showComparison={showComparison}
        dineInCurrent={data.dineInCurrent}
        takeawayCurrent={data.takeawayCurrent}
        dineInPrevious={data.dineInPrevious}
        takeawayPrevious={data.takeawayPrevious}
      />

      <WeatherSummaryCard
        currentData={data.cuacaCurrentStats}
        previousData={data.cuacaPreviousStats}
        currentLogs={data.weatherLogsCurrent}
        previousLogs={data.weatherLogsPrevious}
        currentLabel={data.timeLabel}
        previousLabel={data.prevTimeLabel}
        showComparison={showComparison}
        isDaily={true}
      />
    </div>
  );
}
