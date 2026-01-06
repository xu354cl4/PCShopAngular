import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  AdminProductDto,
  AdminProductListDto
} from '../models/admin-product.model';

@Injectable({ providedIn: 'root' })
export class AdminProductService {

  constructor(private http: HttpClient) { }

  // ===== admin =====

  getProducts(): Observable<AdminProductListDto[]> {
    return this.http.get<AdminProductListDto[]>(`/api/admin/AdminProducts`);
  }

  getProduct(id: number): Observable<AdminProductDto> {
    return this.http.get<AdminProductDto>(`/api/admin/AdminProducts/${id}`);
  }

  createProduct(dto: AdminProductDto): Observable<{ productId: number }> {
    return this.http.post<{ productId: number }>(
      `/api/admin/AdminProducts`,
      dto
    );
  }

  updateProduct(id: number, dto: AdminProductDto): Observable<void> {
    return this.http.put<void>(
      `/api/admin/AdminProducts/${id}`,
      dto
    );
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(
      `/api/admin/AdminProducts/${id}`
    );
  }

  uploadImage(file: File): Observable<{ imageUrl: string }> {
    const fd = new FormData();
    fd.append('file', file);

    return this.http.post<{ imageUrl: string }>(
      `/api/admin/AdminProducts/upload-image`,
      fd
    );
  }

  // ===== Categories =====

  getCategories(): Observable<{ categoryId: number; categoryName: string }[]> {
    return this.http.get<{ categoryId: number; categoryName: string }[]>('/api/admin/AdminProducts/categories');
  }

  createCategory(category: { categoryName: string }): Observable<{ categoryId: number; categoryName: string }> {
    return this.http.post<{ categoryId: number; categoryName: string }>('/api/admin/AdminProducts/categories', category);
  }
}
