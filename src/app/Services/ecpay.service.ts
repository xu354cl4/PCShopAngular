import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ECPayOrder } from '../models/ecpay.models';

@Injectable({
  providedIn: 'root'
})
export class EcpayService {
  // 請確認你的後端執行網址
  private apiUrl = 'https://localhost:7001/api/ECPay';

  constructor(private http: HttpClient) {}

  /**
   * 向後端請求金流參數
   * @param orderData 包含金額、品名等資訊
   */
  getPaymentParams(orderData: ECPayOrder): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/CreateOrder`, orderData);
  }
}
