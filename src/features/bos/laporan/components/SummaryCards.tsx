"use client";

interface Props {
  currentRevenue: number;
  previousRevenue: number;
  currentPortion: number;
  previousPortion: number;
}

export default function SummaryCards({
  currentRevenue,
  previousRevenue,
  currentPortion,
  previousPortion,
}: Props) {
  const formatRevenue = (amount: number) => {
    return new Intl.NumberFormat("id-ID").format(amount);
  };

  const formatPortion = (portion: number) => {
    return new Intl.NumberFormat("id-ID").format(portion);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-4 rounded-2xl shadow-sm">
        <div className="flex justify-between items-start">
          <p className="text-[10px] uppercase font-black tracking-widest text-neutral-400">
            Total Pendapatan
          </p>
          {previousRevenue > 0 && (
            <div
              className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                currentRevenue >= previousRevenue
                  ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
              }`}
            >
              {currentRevenue >= previousRevenue ? "+" : ""}
              {(
                ((currentRevenue - previousRevenue) / previousRevenue) *
                100
              ).toFixed(0)}
              %
            </div>
          )}
        </div>
        <p className="text-xl font-black text-neutral-800 dark:text-white mt-2">
          Rp {formatRevenue(currentRevenue)}
        </p>
        {previousRevenue > 0 && (
          <div className="flex items-center gap-1 mt-1 text-neutral-500">
            <p className="text-[10px] font-bold italic">
              vs Rp {formatRevenue(previousRevenue)}
            </p>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-4 rounded-2xl shadow-sm">
        <div className="flex justify-between items-start">
          <p className="text-[10px] uppercase font-black tracking-widest text-neutral-400">
            Total Porsi
          </p>
          {previousPortion > 0 && (
            <div
              className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                currentPortion >= previousPortion
                  ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
              }`}
            >
              {currentPortion >= previousPortion ? "+" : ""}
              {(
                ((currentPortion - previousPortion) / previousPortion) *
                100
              ).toFixed(0)}
              %
            </div>
          )}
        </div>
        <p className="text-xl font-black text-neutral-800 dark:text-white mt-2">
          {formatPortion(currentPortion)}{" "}
          <span className="text-sm font-bold text-neutral-400">Porsi</span>
        </p>
        {previousPortion > 0 && (
          <div className="flex items-center gap-1 mt-1 text-neutral-500">
            <p className="text-[10px] font-bold italic">
              vs {formatPortion(previousPortion)} Porsi
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
