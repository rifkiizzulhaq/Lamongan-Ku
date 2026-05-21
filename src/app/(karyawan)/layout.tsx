import KaryawanBottomNavbarWrapper from "@/src/components/navbar/KaryawanBottomNavbarWrapper";
import { protectPageRoute } from "@/lib/auth-guard";

export default async function KaryawanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await protectPageRoute(["karyawan", "bos"]);
  return (
    <>
      <main className="grow">{children}</main>
      <KaryawanBottomNavbarWrapper />
    </>
  );
}
