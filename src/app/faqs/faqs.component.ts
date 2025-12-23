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

  // Tree 組裝（你原本的是 OK 的）
  buildTree(data: FaqCategory[]): FaqCategory[] {
    const map = new Map<number, FaqCategory>();
    const roots: FaqCategory[] = [];

    data.forEach(c => map.set(c.id, { ...c, children: [] }));

    map.forEach(c => {
      if (c.parentCategoryId) {
        map.get(c.parentCategoryId)?.children!.push(c);
      } else {
        roots.push(c);
      }
    });

    return roots;
  }



  activeCategoryId?: number;
  activeFaqId?: number;

  selectSubCategory(categoryId: number) {
    this.activeCategoryId = categoryId;

    this.faqs = [];
    this.faqDetail = undefined;
    this.activeFaqId = undefined;

    this.faqService.getFaqsByCategory(categoryId).subscribe(list => {
      this.faqs = list;

      // 8591 風格：先顯示清單；但通常會預設選第一筆（可選）
      if (this.faqs.length) {
        this.openFaq(this.faqs[0].faQid);
      }
    });
  }

  openFaq(faqId: number) {
    if (!faqId) return;

    this.activeFaqId = faqId;
    this.faqDetail = undefined;

    this.faqService.getFaqDetail(faqId).subscribe(res => {
      this.faqDetail = res;
    });
  }

}

