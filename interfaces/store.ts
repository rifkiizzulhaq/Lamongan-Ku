export interface WarungState {
  isBuka: boolean;
  setIsBuka: (buka: boolean) => void;
  catatanLibur: string;
  setCatatanLibur: (catatan: string) => void;
}
