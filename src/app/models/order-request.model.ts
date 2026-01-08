export interface OrderItem {
    productId: number;
    name: string;
    price: number;
    quantity: number;
}

export interface CreateOrderRequest {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    shippingMethod: string;
    paymentMethod: string;
    shippingAddress: string;
    receiverName: string;
    receiverPhone: string;
    receiverAddress: string;
    items: OrderItem[];
    totalAmount: number;
    usedPoints: number;
    userCouponId: number | null;
    shippingFee: number;
    orderNotes?: string;
}

export interface OrderItemDto {
    orderItemId: number;
    orderId: number;
    skuid: number;
    productName: string;
    skuName: string;
    quantity: number;
    priceAtPurchase: number;
    imageUrl: string;
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
