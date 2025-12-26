import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../models/product.model';

// 定義 ApiResponse 型別，對應後端統一回傳格式
export interface ApiResponse<T> {
  data: T;                // 實際資料
  totalItems?: number;     // 分頁時總數
  message?: string;        // 可選訊息
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private apiUrl = 'https://localhost:7001/api/products'; // 後端產品 API
  private categoryApiUrl = 'https://localhost:7001/api/categories'; // 新增：後端分類 API

  constructor(private http: HttpClient) { }

  /**
   * 取得商品列表
   * - 現在回傳 ApiResponse<Product[]>
   * - 前端直接使用 res.data
   */
  getProducts(
    search: string = '',
    page: number = 1,
    pageSize: number = 10,
    sort: string = 'name',
    categories: string[] = [],
    minPrice?: number,
    maxPrice?: number
  ): Observable<ApiResponse<Product[]>> {

    let params = new HttpParams()
      .set('search', search)
      .set('page', page)
      .set('pageSize', pageSize)
      .set('sort', sort);

    if (categories.length) params = params.set('categories', categories.join(','));
    if (minPrice != null) params = params.set('minPrice', minPrice.toString());
    if (maxPrice != null) params = params.set('maxPrice', maxPrice.toString());

    // 修改：直接回傳 ApiResponse，不再 map 轉換
    return this.http.get<ApiResponse<Product[]>>(this.apiUrl, { params });
  }

  /**
   * 新增：取得商品分類列表
   * - 對應 ProductFilterComponent 的 availableCategories
   */
  getCategories(): Observable<ApiResponse<{ id: number, name: string }[]>> {
    return this.http.get<ApiResponse<{ id: number, name: string }[]>>(this.categoryApiUrl);
  }
}
