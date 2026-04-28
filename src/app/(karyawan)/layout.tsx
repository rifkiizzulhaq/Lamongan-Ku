import KaryawanBottomNavbar from "@/src/components/navbar/KaryawanBottomNavbar";

export default function KaryawanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <main className="grow">{children}</main>
      <KaryawanBottomNavbar />
    </>
  );
}
