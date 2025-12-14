import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FaqService } from '../Services/faqs.service';
import { FaqCategory, FaqList, FaqDetail } from '../models/faqs.model';

@Component({
  selector: 'app-faqs',
  standalone: true,
  imports: [CommonModule],   // ⭐⭐⭐ 重點在這
  templateUrl: './faqs.component.html',
  styleUrls: ['./faqs.component.css']
})
export class FaqsComponent implements OnInit {

  categories: FaqCategory[] = [];
  faqs: FaqList[] = [];
  faqDetail?: FaqDetail;

  constructor(private faqService: FaqService) { }

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories() {
    this.faqService.getCategories().subscribe(res => {
      this.categories = this.buildTree(res);
    });
  }

  selectCategory(categoryId: number) {
    this.faqService.getFaqs(categoryId).subscribe(res => {

      console.log('faqs from api:', res);

      this.faqs = res;
      this.faqDetail = undefined;
    });
  }

  openFaq(faqId: number) {
    this.faqService.getFaqDetail(faqId).subscribe(res => {
      this.faqDetail = res;
    });
  }

  // 把平的分類資料組成樹狀
  buildTree(data: FaqCategory[]): FaqCategory[] {
    const map = new Map<number, FaqCategory>();
    const roots: FaqCategory[] = [];

    data.forEach(c => map.set(c.id, { ...c, children: [] }));

    map.forEach(c => {
      if (c.parentCategoryId) {
        map.get(c.parentCategoryId)?.children?.push(c);
      } else {
        roots.push(c);
      }
    });

    return roots;
  }
}
