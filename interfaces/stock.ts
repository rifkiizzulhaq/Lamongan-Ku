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
  sisaKemarin: number;
}

export interface TableItem {
  id: number;
  name: string;
}
