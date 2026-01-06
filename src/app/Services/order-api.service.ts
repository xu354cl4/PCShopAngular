import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CreateOrderRequest } from '../models/order-request.model';
import { Observable } from 'rxjs';
import { OrderList, PagedResult } from '../models/order.model';

@Injectable({
  providedIn: 'root'
})
export class OrderApiService {
  private apiUrl = 'https://localhost:7001/api/order'; // 改成你的後端 URL

  constructor(private http: HttpClient) { }

  //訂單區
  getOrders(page: number, pageSize: number, status?: string, orderno?: string) {
    let params = new HttpParams()
      .set('page', page)
      .set('pageSize', pageSize);

    if (status) {
      params = params.set('status', status);
    }

    if (orderno) {
      params = params.set('orderno', orderno);
    }

    return this.http.get<PagedResult<OrderList>>(`${this.apiUrl}/orders?${params}`);
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
