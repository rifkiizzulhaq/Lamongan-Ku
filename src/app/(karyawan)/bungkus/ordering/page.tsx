import CardOrdering, {
  dummyOrderData,
} from "@/src/components/bungkus/CardOrdering";

export default function Page() {
  return (
    <section className="h-[calc(100dvh-45px)] w-full md:min-h-screen dark:bg-neutral-800 flex flex-col overflow-hidden">
      <header className="w-full h-16 bg-black p-4">
        <div className="max-w-87.5 mx-auto w-full flex items-center justify-between">
          <h1 className="text-2xl font-bold dark:text-white uppercase">
            Bungkus #02
          </h1>
          <span className="flex flex-row-reverse w-30 h-7 bg-white">
            <p className="bg-orange font-semibold w-28 h-full flex items-center justify-center uppercase text-sm text-white">
              ordering
            </p>
          </span>
        </div>
      </header>
      <main className="relative max-w-87.5 mx-auto w-full flex-1 flex flex-col overflow-hidden pt-2">
        <div className="flex-1 overflow-y-auto grid grid-cols-2 gap-2 pb-10 content-start">
          {dummyOrderData.map((order, index) => (
            <CardOrdering
              key={index}
              name={order.name}
              price={order.price}
              quantity={order.quantity}
            />
          ))}
        </div>
      </main>
    </section>
  );
}
