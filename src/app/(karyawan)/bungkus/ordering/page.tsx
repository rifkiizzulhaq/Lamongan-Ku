import CardOrdering, {
  dummyOrderData,
} from "@/src/features/karyawan/pos/components/CardOrdering";
import Cart from "@/src/features/karyawan/pos/components/Cart";
import PageHeader from "@/src/components/ui/PageHeader";

interface PageProps {
  searchParams: Promise<{ mode?: string }>;
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const isUpdate = params.mode === "update";
  const mode = isUpdate ? "update" : "create";

  return (
    <section className="h-[calc(100dvh-45px)] w-full md:min-h-screen dark:bg-neutral-800 flex flex-col overflow-hidden">
      <PageHeader
        title={`Bungkus ${isUpdate ? "#02" : "#01"}`}
        tag="ordering"
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
