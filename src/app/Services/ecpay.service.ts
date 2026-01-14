import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

// 定義後端回傳的資料結構
export interface EcpayResponse {
  success: boolean;
  htmlForm: string; // 這就是綠界跳轉用的 HTML
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class EcpayService {

  // ⭐ 對應後端 ECPayController 的 GetPaymentParams 路徑
  // 請確保 Port (7001 或 7007) 與你後端執行時一致
  private apiUrl = 'https://localhost:7001/api/ECPay/GetPaymentParams';

  constructor(private http: HttpClient) { }

  /**
   * 向後端請求金流參數
   * @param orderId 訂單 ID
   */
  getPaymentParams(orderId: number): Observable<EcpayResponse> {
    // 傳送 JSON Body: { "orderId": 123 }
    return this.http.post<EcpayResponse>(this.apiUrl, { orderId });
  }
  /**
   * 向後端請求門市地圖金流參數
   * @param logisticsData 門市地圖請求資料
   */
  getLogisticsMap(logisticsData: {
    logisticsType: string;
    logisticsSubType: string;
    isCollection: string;
    extraData: string;
  }): Observable<EcpayResponse> {
    return this.http.post<EcpayResponse>('https://91dnz7ll-7001.asse.devtunnels.ms/api/ECPay/LogisticsMap', logisticsData);
  }
}
