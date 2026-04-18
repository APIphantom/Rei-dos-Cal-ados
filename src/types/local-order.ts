export type OrderStatus = "paid" | "pending";

export type LocalOrder = {
  id: string;
  customerName: string;
  amount: number;
  status: OrderStatus;
};
