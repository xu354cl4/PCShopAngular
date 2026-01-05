import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { OrderList } from '../models/order.model';
import { CreateOrderRequest } from '../models/order-request.model';
import { Observable } from 'rxjs';

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

  createOrder(data: CreateOrderRequest): Observable<{ orderId: number }> {
    return this.http.post<{ orderId: number }>(`${this.apiUrl}/orders`, data);
  }

  createCheckoutOrder(data: any): Observable<{ orderId: number }> {
    return this.http.post<{ orderId: number }>(`https://localhost:7001/api/Checkout/Create`, data);
  }

}
