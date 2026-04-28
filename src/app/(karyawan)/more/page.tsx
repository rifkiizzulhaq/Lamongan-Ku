"use client";

import { useState } from "react";
import PageHeader from "@/src/components/ui/PageHeader";
import TutupWarungModal from "@/src/features/karyawan/more/components/TutupWarungModal";
import { LuStore, LuLogOut, LuChevronRight } from "react-icons/lu";
import Button from "@/src/components/ui/Button";

const MENU_ITEMS = [
  {
    label: "Tutup Warung",
    desc: "Kirim laporan & rekap harian",
    icon: <LuStore size={22} strokeWidth={2} />,
    danger: false,
    action: "tutup",
  },
  {
    label: "Logout",
    desc: "Keluar dari akun karyawan",
    icon: <LuLogOut size={22} strokeWidth={2} />,
    danger: true,
    action: "logout",
  },
];

export default function Page() {
  const [showTutup, setShowTutup] = useState(false);

  return (
    <>
      <section className="h-[calc(100dvh-45px)] md:min-h-screen dark:bg-neutral-800 flex flex-col overflow-hidden">
        <PageHeader title="Lainnya" />
        <main className="relative max-w-87.5 mx-auto w-full flex flex-col h-full pt-4 px-0">
          <div className="flex flex-col gap-2">
            {MENU_ITEMS.map((item) => (
              <Button
                key={item.label}
                onClick={() => item.action === "tutup" && setShowTutup(true)}
                className="w-full flex items-center gap-4 px-4 py-4 bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-xl shadow-sm hover:border-orange/40 dark:hover:border-orange/40 active:scale-[0.99] transition-all text-left"
              >
                <span className="w-11 h-11 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-xl shrink-0">
                  {item.icon}
                </span>
                <div className="flex-1">
                  <p
                    className={`text-sm font-black uppercase tracking-wide ${item.danger ? "text-red-500" : "text-neutral-800 dark:text-white"}`}
                  >
                    {item.label}
                  </p>
                  <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-0.5 font-medium">
                    {item.desc}
                  </p>
                </div>
                <LuChevronRight
                  size={16}
                  strokeWidth={2.5}
                  className="text-neutral-300 dark:text-neutral-600 shrink-0"
                />
              </Button>
            ))}
          </div>
        </main>
      </section>

      {showTutup && <TutupWarungModal onClose={() => setShowTutup(false)} />}
    </>
  );
}
