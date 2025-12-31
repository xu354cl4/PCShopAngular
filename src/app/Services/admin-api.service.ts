import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { OrderList } from '../models/Order.model';
import { PagedResult } from '../models/Order.model';

@Injectable({
  providedIn: 'root'
})
export class AdminApiService {
  private apiUrl = 'https://localhost:7001/api/admin'; // 改成你的後端 URL

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
}
