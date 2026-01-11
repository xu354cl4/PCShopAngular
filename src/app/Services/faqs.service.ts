import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FaqCategory, FaqList, FaqDetail, FaqUpsertDto } from '../models/faqs.model';

@Injectable({ providedIn: 'root' })
export class FaqService {

  constructor(private http: HttpClient) { }
  private api = '/api/faq';

  getCategories() {
    return this.http.get<FaqCategory[]>(`https://localhost:7001/api/faq/categories`);
  }

  getFaqsByCategory(categoryId: number) {
    return this.http.get<FaqList[]>(`https://localhost:7001/api/faq/by-category/${categoryId}`);
  }

  getFaqDetail(faqId: number) {
    return this.http.get<FaqDetail>(`https://localhost:7001/api/faq/${faqId}`);
  }
}

