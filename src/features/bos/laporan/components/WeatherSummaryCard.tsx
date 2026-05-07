"use client";

import { LuSun, LuCloud, LuCloudRain } from "react-icons/lu";

import { WeatherStats } from "@/interfaces/models";

interface Props {
  currentData?: WeatherStats | string[];
  previousData?: WeatherStats | string[];
  currentLabel: string;
  previousLabel: string;
  isDaily?: boolean;
}

export default function WeatherSummaryCard({
  currentData,
  previousData,
  currentLabel,
  previousLabel,
  isDaily,
}: Props) {
  const parseDaily = (data?: WeatherStats | string[]): WeatherStats => {
    if (!data) return { cerah: 0, mendung: 0, hujan: 0 };
    if (Array.isArray(data)) {
      return data.reduce(
        (acc, val) => {
          if (val.toLowerCase() === "cerah") acc.cerah += 1;
          if (val.toLowerCase() === "mendung") acc.mendung += 1;
          if (val.toLowerCase() === "hujan") acc.hujan += 1;
          return acc;
        },
        { cerah: 0, mendung: 0, hujan: 0 },
      );
    }
    return data as WeatherStats;
  };

  const currentStats = isDaily
    ? parseDaily(currentData)
    : (currentData as WeatherStats | undefined) || {
        cerah: 0,
        mendung: 0,
        hujan: 0,
      };
  const previousStats = isDaily
    ? parseDaily(previousData)
    : (previousData as WeatherStats | undefined) || {
        cerah: 0,
        mendung: 0,
        hujan: 0,
      };

  const totalCurrent =
    currentStats.cerah + currentStats.mendung + currentStats.hujan;
  if (totalCurrent === 0) return null;

  return (
    <div className="w-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-4 rounded-xl">
      <p className="text-[10px] uppercase font-black tracking-widest text-neutral-400 mb-3">
        Statistik Cuaca
      </p>

      <div className="flex flex-col gap-4">
        <div>
          <p className="text-xs font-bold text-neutral-800 dark:text-white mb-2">
            {currentLabel}
          </p>
          <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-900/30">
              <LuSun className="text-orange-500 mb-1" size={16} />
              <p className="text-xs font-bold dark:text-white">
                {currentStats.cerah}
              </p>
              <p className="text-[9px] text-neutral-500">
                {isDaily ? "Jam" : "Hari"}
              </p>
            </div>
            <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-neutral-50 dark:bg-neutral-700/30 border border-neutral-200 dark:border-neutral-700">
              <LuCloud className="text-neutral-500 mb-1" size={16} />
              <p className="text-xs font-bold dark:text-white">
                {currentStats.mendung}
              </p>
              <p className="text-[9px] text-neutral-500">
                {isDaily ? "Jam" : "Hari"}
              </p>
            </div>
            <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30">
              <LuCloudRain className="text-blue-500 mb-1" size={16} />
              <p className="text-xs font-bold dark:text-white">
                {currentStats.hujan}
              </p>
              <p className="text-[9px] text-neutral-500">
                {isDaily ? "Jam" : "Hari"}
              </p>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-neutral-100 dark:border-neutral-700">
          <p className="text-xs font-bold text-neutral-800 dark:text-white mb-2">
            {previousLabel}
          </p>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400">
              <LuSun size={14} className="text-orange-500" />{" "}
              {previousStats.cerah} {isDaily ? "Jam" : "Hari"}
            </span>
            <span className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400">
              <LuCloud size={14} className="text-neutral-500" />{" "}
              {previousStats.mendung} {isDaily ? "Jam" : "Hari"}
            </span>
            <span className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400">
              <LuCloudRain size={14} className="text-blue-500" />{" "}
              {previousStats.hujan} {isDaily ? "Jam" : "Hari"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
