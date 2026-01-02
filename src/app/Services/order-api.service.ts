import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { OrderList } from '../models/Order.model';

@Injectable({
  providedIn: 'root'
})
export class OrderApiService {
  private apiUrl = 'https://localhost:7001/api/order'; // 改成你的後端 URL

  constructor(private http: HttpClient) { }

  //訂單區
  getOrders(status?: string) {
    return this.http.get<OrderList[]>(
      `${this.apiUrl}/orders`,
      { params: status ? { status } : {} }
    );
  }
getOrderDetail(orderId: number) {
    return this.http.get<any>(
      `${this.apiUrl}/orders/${orderId}`
    );
  }
}
