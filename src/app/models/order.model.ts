export interface Address {
  fullName: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  imageUrl: string;
  size?: string;
}

export interface Order {
  id: string;
  createdAt: string;
  status: number;
  paymentStatus: number;
  subtotal?: number;
  discount?: number;
  total: number;
  couponCode?: string | null;
  items: OrderItem[];
}

export interface CreateOrderItem {
  productId: string;
  quantity: number;
  size?: string | null;
}

export interface CreateOrderRequest {
  shippingAddress: Address;
  billingAddress: Address;
  items: CreateOrderItem[];
  paymentProvider: string;
  couponCode?: string | null;
}
