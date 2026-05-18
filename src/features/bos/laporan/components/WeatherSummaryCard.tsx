"use client";

import { LuSun, LuCloud, LuCloudRain, LuCloudDrizzle } from "react-icons/lu";

import { WeatherStats } from "@/interfaces/models";

interface Props {
  currentData?: WeatherStats | string[];
  previousData?: WeatherStats | string[];
  currentLogs?: { timeRange: string; weather: string }[];
  previousLogs?: { timeRange: string; weather: string }[];
  currentBreakdown?: {
    label: string;
    dominant: string;
    cerah: number;
    mendung: number;
    gerimis: number;
    hujan: number;
    logs?: { timeRange: string; weather: string }[];
  }[];
  previousBreakdown?: {
    label: string;
    dominant: string;
    cerah: number;
    mendung: number;
    gerimis: number;
    hujan: number;
    logs?: { timeRange: string; weather: string }[];
  }[];
  currentLabel: string;
  previousLabel: string;
  isDaily?: boolean;
  showComparison?: boolean;
  intervalName?: string;
}

export default function WeatherSummaryCard({
  currentData,
  previousData,
  currentLogs,
  previousLogs,
  currentBreakdown,
  previousBreakdown,
  currentLabel,
  previousLabel,
  isDaily,
  showComparison,
  intervalName = "Hari",
}: Props) {
  const parseDaily = (data?: WeatherStats | string[]): WeatherStats => {
    if (!data) return { cerah: 0, mendung: 0, gerimis: 0, hujan: 0 };
    if (Array.isArray(data)) {
      return data.reduce(
        (acc, val) => {
          if (val.toLowerCase() === "cerah") acc.cerah += 1;
          if (val.toLowerCase() === "mendung") acc.mendung += 1;
          if (val.toLowerCase() === "gerimis") acc.gerimis += 1;
          if (val.toLowerCase() === "hujan") acc.hujan += 1;
          return acc;
        },
        { cerah: 0, mendung: 0, gerimis: 0, hujan: 0 },
      );
    }
    return data as WeatherStats;
  };

  const currentStats = isDaily
    ? parseDaily(currentData)
    : (currentData as WeatherStats | undefined) || {
        cerah: 0,
        mendung: 0,
        gerimis: 0,
        hujan: 0,
      };

  const previousStats = isDaily
    ? parseDaily(previousData)
    : (previousData as WeatherStats | undefined) || {
        cerah: 0,
        mendung: 0,
        gerimis: 0,
        hujan: 0,
      };

  const getLogRangesFull = (
    logs: { timeRange: string; weather: string }[] | undefined,
    condition: string,
  ) => {
    if (!logs) return null;
    const matches = logs.filter((l) =>
      l.weather.toLowerCase().includes(condition.toLowerCase()),
    );
    if (matches.length === 0) return null;
    return matches.map((l) => l.timeRange).join(", ");
  };

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
          <div className="grid grid-cols-4 gap-2">
            <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-900/30">
              <LuSun className="text-orange-500 mb-1" size={16} />
              <p className="text-xs font-bold dark:text-white">
                {currentStats.cerah}
              </p>
              <p className="text-[9px] text-neutral-500">Jam</p>
            </div>
            <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-neutral-50 dark:bg-neutral-700/30 border border-neutral-200 dark:border-neutral-700">
              <LuCloud className="text-neutral-500 mb-1" size={16} />
              <p className="text-xs font-bold dark:text-white">
                {currentStats.mendung}
              </p>
              <p className="text-[9px] text-neutral-500">Jam</p>
            </div>
            <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900/30">
              <LuCloudDrizzle className="text-indigo-400 mb-1" size={16} />
              <p className="text-xs font-bold dark:text-white">
                {currentStats.gerimis}
              </p>
              <p className="text-[9px] text-neutral-500">Jam</p>
            </div>
            <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30">
              <LuCloudRain className="text-blue-500 mb-1" size={16} />
              <p className="text-xs font-bold dark:text-white">
                {currentStats.hujan}
              </p>
              <p className="text-[9px] text-neutral-500">Jam</p>
            </div>
          </div>
        </div>

        {showComparison !== false &&
          previousStats.cerah +
            previousStats.mendung +
            previousStats.gerimis +
            previousStats.hujan >
            0 && (
            <div className="pt-4 border-t border-neutral-100 dark:border-neutral-700">
              <p className="text-xs font-bold text-neutral-800 dark:text-white mb-2">
                {previousLabel}
              </p>
              <div className="grid grid-cols-4 gap-2 opacity-80">
                <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-900/30 grayscale-20">
                  <LuSun className="text-orange-500 mb-1" size={16} />
                  <p className="text-xs font-bold dark:text-white">
                    {previousStats.cerah}
                  </p>
                  <p className="text-[9px] text-neutral-500">Jam</p>
                </div>
                <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-neutral-50 dark:bg-neutral-700/30 border border-neutral-200 dark:border-neutral-700 grayscale-20">
                  <LuCloud className="text-neutral-500 mb-1" size={16} />
                  <p className="text-xs font-bold dark:text-white">
                    {previousStats.mendung}
                  </p>
                  <p className="text-[9px] text-neutral-500">Jam</p>
                </div>
                <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900/30 grayscale-20">
                  <LuCloudDrizzle className="text-indigo-400 mb-1" size={16} />
                  <p className="text-xs font-bold dark:text-white">
                    {previousStats.gerimis}
                  </p>
                  <p className="text-[9px] text-neutral-500">Jam</p>
                </div>
                <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 grayscale-20">
                  <LuCloudRain className="text-blue-500 mb-1" size={16} />
                  <p className="text-xs font-bold dark:text-white">
                    {previousStats.hujan}
                  </p>
                  <p className="text-[9px] text-neutral-500">Jam</p>
                </div>
              </div>
            </div>
          )}
      </div>

      {isDaily && (currentLogs || previousLogs) && (
        <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-700">
          <p className="text-[10px] uppercase font-black tracking-widest text-neutral-400 mb-3">
            Rincian Waktu Cuaca
          </p>
          <div className="flex flex-col gap-4">
            {[
              { label: currentLabel, logs: currentLogs },
              showComparison !== false
                ? { label: previousLabel, logs: previousLogs }
                : null,
            ]
              .filter(Boolean)
              .map((item) => {
                if (!item) return null;
                const { label, logs } = item;
                if (!logs || logs.length === 0) return null;
                return (
                  <div key={label}>
                    <p className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 mb-1.5">
                      {label}
                    </p>
                    <div className="flex flex-col gap-1.5 text-[10px]">
                      {getLogRangesFull(logs, "cerah") && (
                        <div className="flex items-center gap-1.5">
                          <LuSun
                            size={12}
                            className="text-orange-500 shrink-0"
                          />
                          <span className="font-bold text-orange-500 shrink-0">
                            Cerah:
                          </span>
                          <span className="text-neutral-500 dark:text-neutral-400 leading-tight">
                            {getLogRangesFull(logs, "cerah")}
                          </span>
                        </div>
                      )}
                      {getLogRangesFull(logs, "mendung") && (
                        <div className="flex items-center gap-1.5">
                          <LuCloud
                            size={12}
                            className="text-neutral-500 shrink-0"
                          />
                          <span className="font-bold text-neutral-500 shrink-0">
                            Mendung:
                          </span>
                          <span className="text-neutral-500 dark:text-neutral-400 leading-tight">
                            {getLogRangesFull(logs, "mendung")}
                          </span>
                        </div>
                      )}
                      {getLogRangesFull(logs, "gerimis") && (
                        <div className="flex items-center gap-1.5">
                          <LuCloudDrizzle
                            size={12}
                            className="text-indigo-400 shrink-0"
                          />
                          <span className="font-bold text-indigo-400 shrink-0">
                            Gerimis:
                          </span>
                          <span className="text-neutral-500 dark:text-neutral-400 leading-tight">
                            {getLogRangesFull(logs, "gerimis")}
                          </span>
                        </div>
                      )}
                      {getLogRangesFull(logs, "hujan") && (
                        <div className="flex items-center gap-1.5">
                          <LuCloudRain
                            size={12}
                            className="text-blue-500 shrink-0"
                          />
                          <span className="font-bold text-blue-500 shrink-0">
                            Hujan:
                          </span>
                          <span className="text-neutral-500 dark:text-neutral-400 leading-tight">
                            {getLogRangesFull(logs, "hujan")}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {!isDaily && (currentBreakdown || previousBreakdown) && (
        <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-700">
          <p className="text-[10px] uppercase font-black tracking-widest text-neutral-400 mb-3">
            Rincian Per {intervalName}
          </p>
          <div className="flex flex-col gap-3">
            {[
              { label: currentLabel, breakdown: currentBreakdown },
              showComparison !== false
                ? { label: previousLabel, breakdown: previousBreakdown }
                : null,
            ]
              .filter(Boolean)
              .map((item) => {
                if (!item) return null;
                const { label, breakdown } = item;
                if (!breakdown || breakdown.length === 0) return null;
                return (
                  <div key={label}>
                    <p className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 mb-1.5">
                      {label}
                    </p>
                    <div className="flex flex-col gap-1 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-200 dark:scrollbar-thumb-neutral-700 pr-1">
                      {breakdown.map((b) => {
                        const hasData =
                          b.cerah + b.mendung + b.gerimis + b.hujan > 0;

                        const cerahRange = getLogRangesFull(b.logs, "cerah");
                        const mendungRange = getLogRangesFull(
                          b.logs,
                          "mendung",
                        );
                        const gerimisRange = getLogRangesFull(
                          b.logs,
                          "gerimis",
                        );
                        const hujanRange = getLogRangesFull(b.logs, "hujan");

                        return (
                          <div
                            key={b.label}
                            className="flex flex-col gap-1 py-2 border-b border-neutral-50 dark:border-neutral-800 last:border-0"
                          >
                            <div className="flex items-center gap-2 text-[10px]">
                              <span className="text-neutral-500 dark:text-neutral-400 font-bold min-w-10 uppercase tracking-widest">
                                {b.label}
                              </span>
                              {!hasData && (
                                <span className="text-neutral-300 dark:text-neutral-600 italic">
                                  —
                                </span>
                              )}
                            </div>
                            {hasData && (
                              <div className="flex flex-col gap-1 mt-0.5 ml-12 text-[10px]">
                                {b.cerah > 0 && (
                                  <span className="flex items-start gap-1.5 text-neutral-600 dark:text-neutral-400">
                                    <span>
                                      <LuSun className="text-orange-500 mt-0.5" />
                                    </span>
                                    <span>
                                      <span className="font-bold text-orange-500">
                                        {b.cerah}j
                                      </span>{" "}
                                      {cerahRange && `(${cerahRange})`}
                                    </span>
                                  </span>
                                )}
                                {b.mendung > 0 && (
                                  <span className="flex items-start gap-1.5 text-neutral-600 dark:text-neutral-400">
                                    <span>
                                      <LuCloud className="text-neutral-500 mt-0.5" />
                                    </span>
                                    <span>
                                      <span className="font-bold text-neutral-500">
                                        {b.mendung}j
                                      </span>{" "}
                                      {mendungRange && `(${mendungRange})`}
                                    </span>
                                  </span>
                                )}
                                {b.gerimis > 0 && (
                                  <span className="flex items-start gap-1.5 text-neutral-600 dark:text-neutral-400">
                                    <span>
                                      <LuCloudDrizzle className="text-indigo-400 mt-0.5" />
                                    </span>
                                    <span>
                                      <span className="font-bold text-indigo-400">
                                        {b.gerimis}j
                                      </span>{" "}
                                      {gerimisRange && `(${gerimisRange})`}
                                    </span>
                                  </span>
                                )}
                                {b.hujan > 0 && (
                                  <span className="flex items-start gap-1.5 text-neutral-600 dark:text-neutral-400">
                                    <span>
                                      <LuCloudRain className="text-blue-500 mt-0.5" />
                                    </span>
                                    <span>
                                      <span className="font-bold text-blue-500">
                                        {b.hujan}j
                                      </span>{" "}
                                      {hujanRange && `(${hujanRange})`}
                                    </span>
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
