import PageHeader from "@/src/components/ui/PageHeader";
import StockInputForm from "@/src/features/bos/stock/components/StockInputForm";

export default function Page() {
    return (
        <section className="h-[calc(100dvh-45px)] md:min-h-screen dark:bg-neutral-800 flex flex-col overflow-hidden">
            <PageHeader title="Input Stock Harian" />
            <main className="relative max-w-87.5 mx-auto w-full flex flex-col h-full pt-2">
                <div className="relative w-full flex flex-col h-full overflow-y-auto pb-24 scrollbar-thin scrollbar-thumb-neutral-200 dark:scrollbar-thumb-neutral-700">
                    <StockInputForm />
                </div>
            </main>
        </section>
    )
}