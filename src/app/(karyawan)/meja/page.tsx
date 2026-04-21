import Card from "@/src/components/meja/CardMeja";

export default function Meja() {
  return (
    <section className="h-[calc(100dvh-64px)] md:min-h-screen dark:bg-neutral-800 p-5 flex flex-col overflow-hidden">
      <main className="relative max-w-87.5 mx-auto w-full flex flex-col h-full">
        <div className="mb-5 shrink-0">
          <h1 className="text-2xl font-bold dark:text-white uppercase">
            Makan di tempat
          </h1>
        </div>
        <div className="flex-1 w-full flex gap-3 flex-wrap justify-between content-start overflow-y-auto pb-24 pr-1 scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-700">
          <Card />
          <Card />
          <Card />
          <Card />
          <Card />
          <Card />
        </div>
      </main>
    </section>
  );
}
