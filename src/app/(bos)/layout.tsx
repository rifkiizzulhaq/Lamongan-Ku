import BosBottomNavbar from "@/src/components/navbar/BosBottomNavbar";

export default function BosLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <main className="grow">{children}</main>
      <BosBottomNavbar />
    </>
  );
}
