"use client";

import dynamic from "next/dynamic";
import SkeletonBottomNavbar from "@/src/components/ui/SkeletonBottomNavbar";

const KaryawanBottomNavbar = dynamic(() => import("./KaryawanBottomNavbar"), {
  ssr: false,
  loading: () => <SkeletonBottomNavbar />,
});

export default function KaryawanBottomNavbarWrapper() {
  return <KaryawanBottomNavbar />;
}
