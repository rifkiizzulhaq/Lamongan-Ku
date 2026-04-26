import CardMeja from "@/src/components/meja/CardMeja";
import PageHeader from "@/src/components/ui/PageHeader";

export default function Meja() {
  return (
    <section className="h-[calc(100dvh-64px)] md:min-h-screen dark:bg-neutral-800 flex flex-col overflow-hidden">
      <PageHeader title="Makan di tempat" />
      <main className="relative max-w-87.5 mx-auto w-full flex flex-col h-full pt-2">
        <div className="flex-1 w-full flex gap-3 flex-wrap justify-between content-start overflow-y-auto pb-24 pr-1 scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-700">
          <CardMeja id="meja-1" totalItems={4} isActive={true} />
          <CardMeja id="meja-2" totalItems={6} isActive={false} />
          <CardMeja id="meja-3" totalItems={2} isActive={true} />
          <CardMeja id="meja-4" totalItems={5} isActive={false} />
          <CardMeja id="meja-5" totalItems={3} isActive={true} />
          <CardMeja id="meja-6" totalItems={7} isActive={false} />
        </div>
      </main>
    </section>
  );
}
