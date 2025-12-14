import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FaqCategory, FaqList, FaqDetail } from '../models/faqs.model';

@Injectable({ providedIn: 'root' })
export class FaqService {
  private apiUrl = 'https://localhost:7001/api/faq';
  // ⚠️ 換成你的實際 API

  constructor(private http: HttpClient) { }

  getCategories() {
    return this.http.get<FaqCategory[]>(`${this.apiUrl}/categories`);
  }

  getFaqs(categoryId: number) {
    return this.http.get<FaqList[]>(
      `${this.apiUrl}?categoryId=${categoryId}`
    );
  }

  getFaqDetail(faqId: number) {
    return this.http.get<FaqDetail>(
      `${this.apiUrl}/${faqId}`
    );
  }
}
