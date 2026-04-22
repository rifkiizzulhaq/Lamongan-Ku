import CardMeja from "@/src/components/meja/CardMeja";
import PageHeader from "@/src/components/ui/PageHeader";

export default function Meja() {
  return (
    <section className="h-[calc(100dvh-64px)] md:min-h-screen dark:bg-neutral-800 flex flex-col overflow-hidden">
      <PageHeader title="Makan di tempat" />
      <main className="relative max-w-87.5 mx-auto w-full flex flex-col h-full pt-2">
        <div className="flex-1 w-full flex gap-3 flex-wrap justify-between content-start overflow-y-auto pb-24 pr-1 scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-700">
          <CardMeja />
          <CardMeja />
          <CardMeja />
          <CardMeja />
          <CardMeja />
          <CardMeja />
        </div>
      </main>
    </section>
  );
}
