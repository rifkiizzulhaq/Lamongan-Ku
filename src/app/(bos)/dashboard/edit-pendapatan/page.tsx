import Button from "@/src/components/ui/Button";
import Input from "@/src/components/ui/Input";
import PageHeader from "@/src/components/ui/PageHeader";
import Link from "next/dist/client/link";
import { LuDollarSign } from "react-icons/lu";

export default function Page() {
  return (
    <section className="h-[calc(100dvh-45px)] w-full md:min-h-screen dark:bg-neutral-800 flex flex-col overflow-hidden">
      <PageHeader title="Total Pendapatan" />
      <main className="relative max-w-87.5 mx-auto w-full flex-1 flex flex-col overflow-hidden pt-2">
        <div className="flex flex-col p-5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] w-full">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 mb-4 bg-neutral-50 dark:bg-neutral-700/50 border border-neutral-200 dark:border-neutral-600 rounded-xl flex items-center justify-center text-neutral-600 dark:text-neutral-300">
              <LuDollarSign size={20} strokeWidth={2.5} />
            </div>
          </div>

          <p className="text-neutral-600 dark:text-neutral-400 text-sm font-medium mb-1">
            Total Pendapatan
          </p>

          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-3xl font-black text-neutral-900 dark:text-white tracking-tight">
              Rp 12.500.000
            </h2>
          </div>
        </div>
        <div className="mt-2">
          <div className="flex flex-col gap-2 px-2">
            <label htmlFor="pendapatan">Masukan uang fisik di kotak:</label>
            <Input
              id="pendapatan"
              type="number"
              placeholder="0"
              className="w-full mt-2 px-4 py-3 bg-neutral-50 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-xl text-neutral-800 dark:text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange/50"
            />
          </div>
          <div className="w-full h-15 bg-red-500/50 flex items-center mt-3">
            <div className="w-2 h-full bg-red-500"></div>
            <div className="flex items-center justify-center p-4">
              <h2>Selisih: </h2>
            </div>
          </div>
          <div className="mt-3 flex w-full justify-end gap-2">
            <Link href="/dashboard" className="flex items-center justify-center bg-neutral-500 text-white w-25 h-10 rounded-full">
              Kembali
            </Link>
            <Button className="bg-orange text-white w-25 h-10 rounded-full">
              Simpan
            </Button>
          </div>
        </div>
      </main>
    </section>
  );
}
