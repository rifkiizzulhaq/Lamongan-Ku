export interface SisaItem {
  nama: string;
  sisa?: number;
  stockId?: number;
}

export interface StockFormItem {
  id: number;
  nama: string;
  price: number;
  quantity: number | null;
  initialQuantity: number | null;
  sisaKemarin: number;
  isUnlimited: boolean;
}

export interface TableItem {
  id: number;
  name: string;
}
