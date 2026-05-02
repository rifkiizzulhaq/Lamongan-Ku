import { create } from 'zustand';

interface WarungState {
  isBuka: boolean;
  setIsBuka: (buka: boolean) => void;
  catatanLibur: string;
  setCatatanLibur: (catatan: string) => void;
}

export const useWarungStore = create<WarungState>((set) => ({
  isBuka: true,
  setIsBuka: (buka) => set({ isBuka: buka }),
  catatanLibur: "",
  setCatatanLibur: (catatan) => set({ catatanLibur: catatan }),
}));
