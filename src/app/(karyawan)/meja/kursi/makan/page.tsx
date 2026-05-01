"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import CardOrdering, {
  dummyOrderData,
} from "@/src/features/karyawan/pos/components/CardOrdering";
import Cart from "@/src/features/karyawan/pos/components/Cart";
import PageHeader from "@/src/components/ui/PageHeader";

function MakanContent() {
  const [isTakeaway, setIsTakeaway] = useState(false);
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") === "update" ? "update" : "create";

  return (
    <section className="h-[calc(100dvh-45px)] w-full md:min-h-screen dark:bg-neutral-800 flex flex-col overflow-hidden">
      <PageHeader
        title="Meja 1"
        tag={isTakeaway ? "Bungkus" : "Makan di tempat"}
        onTagClick={() => setIsTakeaway(!isTakeaway)}
      />
      <main className="relative max-w-87.5 mx-auto w-full flex-1 flex flex-col overflow-hidden pt-2">
        <div className="flex-1 overflow-y-auto grid grid-cols-2 gap-2 pb-5 content-start">
          {dummyOrderData.map((order, index) => (
            <CardOrdering
              key={index}
              name={order.name}
              price={order.price}
              quantity={order.quantity}
              sisa={order.sisa}
            />
          ))}
        </div>
      </main>
      <Cart mode={mode} />
    </section>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="h-screen w-full bg-neutral-800" />}>
      <MakanContent />
    </Suspense>
  );
}
