import BottomNavbar from "@/src/components/navbar/BottomNavbar";

export default function KaryawanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <main className="grow">{children}</main>
      <BottomNavbar />
    </>
  );
}
