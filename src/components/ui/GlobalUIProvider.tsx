"use client";

import GlobalToast from "./GlobalToast";
import GlobalConfirmModal from "./GlobalConfirmModal";

export default function GlobalUIProvider() {
  return (
    <>
      <GlobalToast />
      <GlobalConfirmModal />
    </>
  );
}
