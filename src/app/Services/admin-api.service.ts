import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { OrderList } from '../models/Order.model';

@Injectable({
  providedIn: 'root'
})
export class AdminApiService {
  private apiUrl = 'https://localhost:7001/api/admin'; // 改成你的後端 URL

  constructor(private http: HttpClient) { }

  //訂單區
  getOrders(status?: string, orderno?: string) {
    let params = new HttpParams();

    if (status && status !== '') {
      params = params.set('status', status);
    }
    if (orderno && orderno.trim() !== '') {
      params = params.set('orderno', orderno.trim());
    }
    return this.http.get<OrderList[]>(
      `${this.apiUrl}/orders`,
      { params }
    );
  }
  getOrderDetail(orderId: number) {
    return this.http.get<any>(
      `${this.apiUrl}/orders/${orderId}`
    );
  }
}
