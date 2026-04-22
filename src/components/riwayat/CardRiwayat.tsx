export interface OrderHistory {
  id: string;
  type: "Bungkus" | "Meja";
  tableNumber?: number;
  date: string;
  total: number;
  status: "Selesai" | "Dibatalkan";
}

export default function CardRiwayat({ data }: { data: OrderHistory }) {
  const isSelesai = data.status === "Selesai";

  return (
    <div className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700/50 rounded-xl p-4 flex flex-col gap-3 shadow-sm">
      <div className="flex justify-between items-center border-b border-neutral-100 dark:border-neutral-800 pb-2">
        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-semibold px-2 py-1 rounded-md ${
              data.type === "Meja"
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                : "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
            }`}
          >
            {data.type}
            {data.type === "Meja" && data.tableNumber
              ? ` ${data.tableNumber}`
              : ""}
          </span>
          <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
            {data.id}
          </span>
        </div>
        <span
          className={`text-xs font-medium px-2 py-1 rounded-full ${
            isSelesai
              ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
              : "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
          }`}
        >
          {data.status}
        </span>
      </div>

      <div className="flex justify-between items-end">
        <div className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
          {data.date}
        </div>
        <div className="text-lg font-bold text-neutral-900 dark:text-white">
          Rp {data.total.toLocaleString("id-ID")}
        </div>
      </div>
    </div>
  );
}
