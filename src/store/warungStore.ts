import { create } from "zustand";

import { WarungState } from "../../interfaces/store";

export const useWarungStore = create<WarungState>((set) => ({
  isBuka: true,
  setIsBuka: (buka) => set({ isBuka: buka }),
  catatanLibur: "",
  setCatatanLibur: (catatan) => set({ catatanLibur: catatan }),
}));
