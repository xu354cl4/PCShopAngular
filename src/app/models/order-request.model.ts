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
    orderNotes?: string;
}
