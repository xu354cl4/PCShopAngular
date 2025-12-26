import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FaqCategory, FaqList, FaqDetail, FaqUpsertDto, FaqAdminModel } from '../models/faqs.model';

@Injectable({ providedIn: 'root' })
export class FaqBackApiService {

  private base = '/api/faqs-admin';

  constructor(private http: HttpClient) { }

  // 分類
  getCategories() {
    return this.http.get<FaqCategory[]>(`${this.base}/categories`);
  }

  createCategory(dto: {
    categoryName: string;
    parentCategoryId?: number;
  }) {
    return this.http.post<FaqCategory>(
      `${this.base}/categories`,
      dto
    );
  }

  // 問題
  getFaqsByCategory(categoryId: number) {
    return this.http.get<FaqList[]>(`${this.base}?categoryId=${categoryId}`);
  }

  getFaqForEdit(faqId: number) {
    return this.http.get<FaqAdminModel>(`${this.base}/${faqId}`);
  }

  upsertFaq(dto: FaqUpsertDto) {
    return this.http.post(`${this.base}/upsert`, dto);
  }

  uploadImage(file: File) {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<{ imageUrl: string }>(
      '/api/upload/faq-image',
      form
    );
  }
  deleteFaq(faqId: number) {
    return this.http.delete<void>(`${this.base}/${faqId}`);
  }
  deleteCategory(categoryId: number) {
    return this.http.delete<void>(`${this.base}/categories/${categoryId}`);
  }
}
