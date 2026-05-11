import KaryawanBottomNavbarWrapper from "@/src/components/navbar/KaryawanBottomNavbarWrapper";

export default function KaryawanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <main className="grow">{children}</main>
      <KaryawanBottomNavbarWrapper />
    </>
  );
}
