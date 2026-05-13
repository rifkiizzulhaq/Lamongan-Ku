import Link from "next/link";
import { LuTriangle } from "react-icons/lu";

interface LockedPageProps {
  type: "holiday" | "locked";
  customMessage?: string;
}

export default function LockedPage({ type, customMessage }: LockedPageProps) {
  const isHoliday = type === "holiday";

  const defaultMessage = isHoliday
    ? "Halaman ini dikunci karena status warung saat ini sedang LIBUR."
    : "Anda baru bisa mengakses halaman ini setelah karyawan mengirim Laporan Tutup Warung hari ini.";

  return (
    <section className="h-[calc(100dvh-45px)] w-full dark:bg-neutral-800 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
      <div className="w-20 h-20 bg-amber-50 dark:bg-amber-900/20 rounded-3xl flex items-center justify-center text-amber-500 mb-6 border-2 border-amber-100 dark:border-amber-800/50">
        <LuTriangle size={40} strokeWidth={2.5} className="animate-pulse" />
      </div>
      <h2 className="text-xl font-black text-neutral-900 dark:text-white mb-2">
        {isHoliday ? "Warung Sedang Libur" : "Halaman Masih Terkunci"}
      </h2>
      <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-8 max-w-64 leading-relaxed">
        {customMessage || defaultMessage}
      </p>
      <Link
        href="/dashboard"
        className="bg-neutral-100 dark:bg-neutral-700 text-neutral-900 dark:text-white font-bold px-8 py-3 rounded-2xl hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-all active:scale-95 shadow-sm"
      >
        Kembali ke Dashboard
      </Link>
    </section>
  );
}
