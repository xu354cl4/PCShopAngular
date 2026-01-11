export interface OrderItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
}

export interface CreateOrderRequest {
  shippingMethodId: number
  shippingAddress: string
  receiverName: string
  receiverPhone: string

  // string SelectedGateway
  // string SelectedPayment
  shippingMethod: string
  paymentMethod: string

  userCouponId: number
  usePoints: number
}

export interface OrderItemDto {
  orderItemId: number;
  orderId: number;
  skuid: number;
  productName: string;
  skuName: string;
  quantity: number;
  priceAtPurchase: number;
  unitPriceAtPurchase: number;
  imageUrl: string;
  productImage: string;
}

export interface OrderDetailDto {
  orderId: number;
  orderNo: string;
  totalAmount: number;
  orderStatus: number;
  createDate: string; // DateTime 轉換為 ISO 字串
  shippingFee: number;
  usedPoints: number;
  discountAmount: number;
  shippingMethodName: string;
  receiverName: string;
  receiverPhone: string;
  shippingAddress: string;
  couponCode: string;
  couponId: number | null;
  couponDiscount: number;
  couponDiscountType: string;
  couponDiscountValue: number | null;
  subtotal: number;
  statusName: string;
  selectedPayment: string;
  items: OrderItemDto[];
}
export interface CreateOrderResponse {
  orderId: number;
  success: boolean;
  htmlForm?: string; // 綠界回傳的表單 HTML
  message?: string
}
