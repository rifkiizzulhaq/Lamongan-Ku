"use client";

import { useState } from "react";
import Link from "next/link";
import PageHeader from "@/src/components/ui/PageHeader";
import CardKursi from "@/src/features/karyawan/meja/components/CardKursi";
import { LuUsers, LuUtensils, LuUser, LuPlus } from "react-icons/lu";
import Button from "@/src/components/ui/Button";

const dummyKursi = [
  {
    id: "Item 1",
    totalPrice: 60000,
    status: "Sedang Makan..",
    items: [
      { n: "Ayam Goreng", q: 2 },
      { n: "Nasi Putih", q: 2 },
      { n: "Es Teh Manis", q: 2 },
    ],
    label: "Bungkus",
    tipe: "rombongan",
  },
  {
    id: "Item 2",
    totalPrice: 25000,
    status: "Sedang Makan..",
    items: [
      { n: "Lele Goreng", q: 1 },
      { n: "Nasi Putih", q: 1 },
    ],
    label: "",
    tipe: "sendiri",
  },
  {
    id: "Item 3",
    totalPrice: 120000,
    status: "Sedang Makan..",
    items: [
      { n: "Bebek Jumbo", q: 4 },
      { n: "Nasi Putih", q: 4 },
      { n: "Sambal Extra", q: 4 },
      { n: "Es Jeruk", q: 4 },
    ],
    label: "",
    tipe: "makan bareng",
  },
];

const modeOptions = [
  //   { label: "Rombongan", href: "/meja/makan?mode=rombongan", icon: <LuUsers /> },
  {
    label: "Rombongan",
    href: "/meja/kursi/makan?mode=create",
    icon: <LuUsers />,
  },
  {
    label: "Makan Bareng",
    href: "/meja/kursi/makan?mode=create",
    icon: <LuUtensils />,
  },
  { label: "Sendiri", href: "/meja/kursi/makan?mode=create", icon: <LuUser /> },
];

export default function Page() {
  const [open, setOpen] = useState(false);

  return (
    <section className="h-[calc(100dvh-45px)] md:min-h-screen dark:bg-neutral-800 flex flex-col overflow-hidden">
      <PageHeader title="Meja 1" tag="Makan di tempat" />
      <main className="relative max-w-87.5 mx-auto w-full flex flex-col h-full pt-2">
        <div className="absolute bottom-25 right-0 z-50 flex flex-col items-end gap-2">
          {open && (
            <div className="flex flex-col items-end gap-2">
              {modeOptions.map((opt) => (
                <Link
                  key={opt.label}
                  href={opt.href}
                  onClick={() => setOpen(false)}
                >
                  <div className="flex items-center gap-2">
                    <span className="bg-white dark:bg-neutral-900 text-neutral-800 dark:text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md border border-neutral-200 dark:border-neutral-700 whitespace-nowrap">
                      {opt.label}
                    </span>
                    <span className="w-10 h-10 rounded-full bg-neutral-800 dark:bg-white text-white dark:text-black flex items-center justify-center shadow-lg text-base">
                      {opt.icon}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <Button
            onClick={() => setOpen((v) => !v)}
            className={`w-12 h-12 rounded-full shadow-lg font-black text-xl flex items-center justify-center transition-all duration-200 active:scale-95 ${
              open
                ? "bg-orange text-white rotate-45"
                : "bg-neutral-800 dark:bg-white text-white dark:text-black"
            }`}
          >
            <LuPlus size={24} strokeWidth={3} />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto flex flex-col gap-4 pb-40 pr-1 scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-700">
          {dummyKursi.map((kursi, idx) => (
            <CardKursi
              key={idx}
              id={kursi.id}
              totalPrice={kursi.totalPrice}
              status={kursi.status}
              items={kursi.items}
              label={kursi.label}
              tipe={kursi.tipe}
            />
          ))}
        </div>
      </main>
    </section>
  );
}
