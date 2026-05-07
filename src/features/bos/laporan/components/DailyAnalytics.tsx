"use client";

import { DailyData } from "@/interfaces/models";
import TrendLineChart from "./charts/TrendLineChart";
import OrderTypeChart from "./charts/OrderTypeChart";
import OrderTypeTimelineChart from "./charts/OrderTypeTimelineChart";
import SisaBahanChart from "./charts/SisaBahanChart";
import WeatherSummaryCard from "./WeatherSummaryCard";
import { LuInfo } from "react-icons/lu";

interface Props {
  data: DailyData;
}

export default function DailyAnalytics({ data }: Props) {
  return (
    <div className="flex flex-col gap-5 pb-6">
      {data.isLiburCurrent && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 p-4 rounded-xl flex gap-3 items-start">
          <LuInfo className="shrink-0 mt-0.5" size={18} />
          <div>
            <p className="font-bold text-sm">Warung Libur Hari Ini</p>
            <p className="text-xs mt-1">
              {data.alasanLiburCurrent || "Tidak ada alasan spesifik."}
            </p>
          </div>
        </div>
      )}

      {data.isLiburPrevious && (
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

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-4 rounded-xl">
          <p className="text-[10px] uppercase font-black tracking-widest text-neutral-400">
            Total Pendapatan
          </p>
          <p className="text-xl font-black text-neutral-800 dark:text-white mt-1">
            Rp {(data.totalRevenueCurrent / 1000000).toFixed(2)} Jt
          </p>
          <p className="text-xs font-bold mt-1 text-neutral-500">
            vs Rp {(data.totalRevenuePrevious / 1000000).toFixed(2)} Jt
          </p>
        </div>
        <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-4 rounded-xl">
          <p className="text-[10px] uppercase font-black tracking-widest text-neutral-400">
            Total Porsi
          </p>
          <p className="text-xl font-black text-neutral-800 dark:text-white mt-1">
            {data.portionCurrent} Porsi
          </p>
          <p className="text-xs font-bold mt-1 text-neutral-500">
            vs {data.portionPrevious} Porsi
          </p>
        </div>
      </div>

      <TrendLineChart
        title="Pendapatan (Harian)"
        subtitle={`Perbandingan pendapatan per jam ${data.timeLabel} vs ${data.prevTimeLabel}`}
        labels={data.revenueLabels}
        currentData={data.revenueCurrent}
        previousData={data.revenuePrevious}
        currentLabel={data.timeLabel}
        previousLabel={data.prevTimeLabel}
      />

      <OrderTypeTimelineChart
        title="Tren Pesanan Per Jam"
        subtitle={`Perbandingan Makan di Tempat vs Bungkus pada ${data.timeLabel} vs ${data.prevTimeLabel}`}
        labels={data.revenueLabels}
        currentLabel={data.timeLabel}
        previousLabel={data.prevTimeLabel}
        dineInTrend={data.dineInTrend || []}
        takeawayTrend={data.takeawayTrend || []}
        dineInPreviousTrend={data.dineInPreviousTrend || []}
        takeawayPreviousTrend={data.takeawayPreviousTrend || []}
      />

      <OrderTypeChart
        title="Total Tipe Pesanan"
        subtitle={`Makan di Tempat vs Bungkus pada ${data.timeLabel} vs ${data.prevTimeLabel}`}
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
        isDaily={true}
      />

      <SisaBahanChart
        data={data.sisaBahan}
        currentLabel={data.timeLabel}
        previousLabel={data.prevTimeLabel}
      />
    </div>
  );
}
