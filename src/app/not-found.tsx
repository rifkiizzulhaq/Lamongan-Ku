import Link from "next/link";
import Button from "../components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <h2 className="text-6xl font-black text-orange mb-4">404</h2>
      <h3 className="text-xl font-bold text-neutral-800 dark:text-white mb-2">
        Halaman Tidak Ditemukan
      </h3>
      <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">
        Maaf, menu atau halaman yang Anda cari tidak tersedia di sistem.
      </p>
      <Link href="/">
        <Button className="px-6 py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold rounded-xl active:scale-95 transition-all shadow-lg">
          Kembali ke Beranda
        </Button>
      </Link>
    </div>
  );
}