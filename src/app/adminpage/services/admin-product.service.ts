import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  AdminProductDto,
  AdminProductListDto,
  ProductSkuDto,
  CategoryDto
} from '../models/admin-product.model';

@Injectable({ providedIn: 'root' })
export class AdminProductService {
  constructor(private http: HttpClient) { }

  // ===== 商品 CRUD =====
  getProducts(): Observable<AdminProductListDto[]> {
    return this.http.get<AdminProductListDto[]>('/api/admin/AdminProducts');
  }

  getProduct(id: number): Observable<AdminProductDto> {
    return this.http.get<AdminProductDto>(`/api/admin/AdminProducts/${id}`);
  }

  createProduct(dto: AdminProductDto): Observable<{ productId: number }> {
    return this.http.post<{ productId: number }>('/api/admin/AdminProducts', dto);
  }

  updateProduct(id: number, dto: AdminProductDto): Observable<void> {
    return this.http.put<void>(`/api/admin/AdminProducts/${id}`, dto);
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`/api/admin/AdminProducts/${id}`);
  }

  uploadImage(file: File): Observable<{ imageUrl: string }> {
    const fd = new FormData();
    fd.append('file', file);
    return this.http.post<{ imageUrl: string }>('/api/admin/AdminProducts/upload-image', fd);
  }

  // ===== 分類 =====
  getCategories(): Observable<CategoryDto[]> {
    return this.http.get<CategoryDto[]>('/api/admin/AdminProducts/categories');
  }

  createCategory(category: { categoryName: string }): Observable<CategoryDto> {
    return this.http.post<CategoryDto>('/api/admin/AdminProducts/categories', category);
  }

  // ===== SKU CRUD =====
  getSkus(productId: number): Observable<ProductSkuDto[]> {
    return this.http.get<ProductSkuDto[]>(`/api/admin/AdminProducts/${productId}/skus`);
  }

  createSku(productId: number, dto: ProductSkuDto): Observable<{ skuid: number }> {
    return this.http.post<{ skuid: number }>(`/api/admin/AdminProducts/${productId}/skus`, dto);
  }

  updateSku(dto: ProductSkuDto): Observable<void> {
    return this.http.put<void>(`/api/admin/AdminProducts/skus/${dto.skuid}`, dto);
  }

  deleteSku(skuid: number): Observable<void> {
    return this.http.delete<void>(`/api/admin/AdminProducts/skus/${skuid}`);
  }
}
