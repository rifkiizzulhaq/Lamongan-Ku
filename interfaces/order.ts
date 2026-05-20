export interface CartItem {
  stockId: number;
  name: string;
  price: number;
  quantity: number;
  isTakeaway?: boolean;
}

export interface OrderItem {
  n: string;
  q: number;
  isTakeaway?: boolean;
}

export interface KursiItem {
  n: string;
  q: number;
  isTakeaway?: boolean;
}
