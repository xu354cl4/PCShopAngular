import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private apiUrl = 'http://localhost:5000/api/products'; // 後端 API

  constructor(private http: HttpClient) { }

  getProducts(
    search: string = '',
    page: number = 1,
    pageSize: number = 10,
    sort: string = 'name',
    categories: string[] = [],
    minPrice?: number,
    maxPrice?: number
  ): Observable<{ items: Product[], totalItems: number }> {
    let params = new HttpParams()
      .set('search', search)
      .set('page', page)
      .set('pageSize', pageSize)
      .set('sort', sort);

    if (categories.length) params = params.set('categories', categories.join(','));
    if (minPrice != null) params = params.set('minPrice', minPrice.toString());
    if (maxPrice != null) params = params.set('maxPrice', maxPrice.toString());

    return this.http.get<{ products: Product[], totalCount: number }>(this.apiUrl, { params })
      .pipe(
        map(res => ({
          items: res?.products || [],       // 確保 items 永遠有陣列
          totalItems: res?.totalCount || 0
        }))
      );
  }
}
