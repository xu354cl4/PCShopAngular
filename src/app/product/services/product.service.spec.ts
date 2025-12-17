import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../models/product.model';
import { ProductFilter } from '../models/product-filter.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private apiUrl = 'https://localhost:5001/api/products'; // 改成你的 API URL

  constructor(private http: HttpClient) { }

  getProducts(
    keyword: string,
    sortBy: string,
    filter: ProductFilter,
    page: number,
    pageSize: number
  ): Observable<{ data: Product[], total: number }> {

    let params = new HttpParams()
      .set('page', page)
      .set('pageSize', pageSize);

    if (keyword) params = params.set('keyword', keyword);
    if (sortBy) params = params.set('sortBy', sortBy);

    if (filter.minPrice != null) params = params.set('minPrice', filter.minPrice);
    if (filter.maxPrice != null) params = params.set('maxPrice', filter.maxPrice);
    if (filter.categories?.length) {
      filter.categories.forEach(c => {
        params = params.append('categories', c);
      });
    }

    return this.http.get<{ data: Product[], total: number }>(this.apiUrl, { params });
  }
}

