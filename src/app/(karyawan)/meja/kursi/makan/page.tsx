"use client";

import { useState } from "react";
import CardOrdering, { dummyOrderData } from "@/src/components/CardOrdering";
import Cart from "@/src/components/Cart";
import PageHeader from "@/src/components/ui/PageHeader";

export default function Page() {
  const [isTakeaway, setIsTakeaway] = useState(false);

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
      <Cart />
    </section>
  );
}
