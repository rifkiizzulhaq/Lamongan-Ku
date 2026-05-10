import SkeletonRoot from "@/src/components/ui/SkeletonRoot";
import SkeletonBottomNavbar from "@/src/components/ui/SkeletonBottomNavbar";

export default function Loading() {
  return (
    <>
      <SkeletonRoot />
      <SkeletonBottomNavbar />
    </>
  );
}
