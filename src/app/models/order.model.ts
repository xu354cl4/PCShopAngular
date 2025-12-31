
export interface OrderList {
  orderId: number;
  orderNo: string;
  createDate: string;
  totalAmount: number;
  status: string;
}

export interface OrderDetail {
  orderId: number;
  orderNo: string;
  status: number | string ;
  totalAmount: number;
  items: {
    productName: string;
    productImage:string;
    unitPriceAtPurchase:number;
    quantity: number;
  }[];
}

export interface PagedResult<T> {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  items: T[];
}





