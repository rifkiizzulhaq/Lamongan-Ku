"use client";

import dynamic from "next/dynamic";
import SkeletonBottomNavbar from "@/src/components/ui/SkeletonBottomNavbar";

const BosBottomNavbar = dynamic(() => import("./BosBottomNavbar"), {
  ssr: false,
  loading: () => <SkeletonBottomNavbar />,
});

export default function BosBottomNavbarWrapper() {
  return <BosBottomNavbar />;
}
