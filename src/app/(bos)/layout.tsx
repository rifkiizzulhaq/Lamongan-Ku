import BosBottomNavbarWrapper from "@/src/components/navbar/BosBottomNavbarWrapper";
import { protectPageRoute } from "@/lib/auth-guard";

export default async function BosLayout({ children }: { children: React.ReactNode }) {
  await protectPageRoute(["bos"]);
  return (
    <>
      <main className="grow">{children}</main>
      <BosBottomNavbarWrapper />
    </>
  );
}
