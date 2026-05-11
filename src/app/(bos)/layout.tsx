import BosBottomNavbarWrapper from "@/src/components/navbar/BosBottomNavbarWrapper";

export default function BosLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <main className="grow">{children}</main>
      <BosBottomNavbarWrapper />
    </>
  );
}
