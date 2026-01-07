import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CreateOrderRequest } from '../models/order-request.model';
import { Observable } from 'rxjs';
import { OrderList, PagedResult } from '../models/order.model';

@Injectable({
  providedIn: 'root'
})
export class OrderApiService {
  private apiUrl = '/api/Order'; // 使用大寫 O 以符合常見後端慣例

  constructor(private http: HttpClient) { }

  // 訂單區
  getOrders(page: number, pageSize: number, status?: string, orderno?: string) {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (status) {
      params = params.set('status', status);
    }

    if (orderno) {
      params = params.set('orderno', orderno);
    }

    return this.http.get<PagedResult<OrderList>>(`${this.apiUrl}/orders`, { params });
  }

  getOrderDetail(orderId: number) {
    return this.http.get<any>(
      `${this.apiUrl}/orders/${orderId}`
    );
  }

  createOrder(data: CreateOrderRequest): Observable<{ orderId: number }> {
    return this.http.post<{ orderId: number }>(`${this.apiUrl}/orders`, data);
  }

  createCheckoutOrder(data: CreateOrderRequest): Observable<{ orderId: number }> {
    return this.http.post<{ orderId: number }>(`/api/Checkout/Create`, data);
  }

  getOrderItems(orderId: number): Observable<any[]> {
    return this.http.get<any[]>(`/api/OrderItems/${orderId}`);
  }

  getOrderDetailByApi(orderId: string | number): Observable<any> {
    // 根據追蹤與 404 報錯，/api/detail 並不存在。改用專案中已確認可運行的路徑。
    return this.http.get<any>(`${this.apiUrl}/orders/${orderId}`);
  }
}
