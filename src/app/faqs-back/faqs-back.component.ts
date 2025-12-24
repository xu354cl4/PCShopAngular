import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { FaqBackApiService } from '../Services/faqsback.service';
import {
  FaqAdminModel,
  FaqBackBlock,
  FaqUpsertDto,
  FaqCategory
} from '../models/faqs.model';

@Component({
  selector: 'app-faqs-back',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './faqs-back.component.html'
})
export class FaqsBackComponent implements OnInit {

  categories: FaqCategory[] = [];

  selectedParentCategoryId?: number;

  model: FaqAdminModel = {
    categoryId: 0,
    question: '',
    blocks: []
  };

  uploading = false;
  isEditMode = false;

  constructor(
    private api: FaqBackApiService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.loadCategories();

    const faqId = this.route.snapshot.paramMap.get('id');
    if (faqId) {
      this.isEditMode = true;
      this.loadFaq(+faqId);
    } else {
      this.ensureAtLeastOneTextBlock();
    }
  }

  /* ---------- 分類 ---------- */

  loadCategories() {
    this.api.getCategories().subscribe(res => {
      this.categories = res;
    });
  }

  /* ---------- FAQ ---------- */

  loadFaq(faqId: number) {
    this.api.getFaqForEdit(faqId).subscribe(res => {
      this.model = res;
      this.ensureAtLeastOneTextBlock();
    });
  }

  save() {
    const dto: FaqUpsertDto = {
      faqId: this.model.faqId,
      categoryId: this.model.categoryId,
      question: this.model.question,
      blocks: this.model.blocks.map((b, i) => ({
        blockType: b.blockType,
        content: b.content,
        imageUrl: b.imageUrl,
        sortOrder: i
      }))
    };

    this.api.upsertFaq(dto).subscribe(() => {
      alert('FAQ 已儲存');
    });
  }

  /* ---------- Blocks ---------- */

  ensureAtLeastOneTextBlock() {
    if (!this.model.blocks || this.model.blocks.length === 0) {
      this.model.blocks = [this.createTextBlock()];
    }
  }

  createTextBlock(): FaqBackBlock {
    return { blockType: 'TEXT', content: '' };
  }

  insertImage(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.uploading = true;

    this.api.uploadImage(file).subscribe(res => {
      this.model.blocks.splice(
        index + 1,
        0,
        { blockType: 'IMAGE', imageUrl: res.imageUrl },
        this.createTextBlock()
      );
      this.uploading = false;
    });

    input.value = '';
  }

  removeBlock(index: number) {
    if (this.model.blocks.length === 1) {
      alert('至少要保留一個文字區塊');
      return;
    }

    this.model.blocks.splice(index, 1);
    this.ensureAtLeastOneTextBlock();
  }
}
