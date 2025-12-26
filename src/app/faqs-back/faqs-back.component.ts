import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  FaqAdminModel,
  FaqBackBlock,
  FaqUpsertDto,
  FaqCategory,
  FaqList
} from '../models/faqs.model';
import { FaqBackApiService } from '../Services/faqsback.service';

@Component({
  selector: 'app-faqs-back',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './faqs-back.component.html',

})
export class FaqsBackComponent implements OnInit {

  // ===== 狀態 =====
  isEditMode = false;
  uploading = false;
  faqs: FaqList[] = [];
  // ===== 分類 =====
  categories: FaqCategory[] = [];

  selectedParentCategoryId?: number; // 大分類
  selectedCategoryId?: number;       // 小分類（實際存 FAQ 用）

  showAddParent = false;
  showAddChild = false;
  showAddCategory = false;
  newCategoryName = '';
  newParentName = '';
  newChildName = '';

  // ===== FAQ Model =====
  model: FaqAdminModel = {
    categoryId: undefined as any,
    question: '',
    blocks: [{ blockType: 'TEXT', content: '' }]
  };

  constructor(private api: FaqBackApiService) { }

  ngOnInit() {
    this.loadCategories();
    this.resetToCreateMode();
  }


  // =============================
  // 分類
  // =============================
  loadCategories() {
    this.api.getCategories().subscribe(c => {
      this.categories = c;
    });
  }

  createCategory() {
    if (!this.newCategoryName.trim()) return;

    this.api.createCategory({
      categoryName: this.newCategoryName,
      parentCategoryId: this.selectedParentCategoryId
    }).subscribe((created: FaqCategory) => {
      this.loadCategories();
      this.newCategoryName = '';
      this.showAddCategory = false;
    });
  }

  createParentCategory() {
    if (!this.newParentName.trim()) return;

    this.api.createCategory({ categoryName: this.newParentName })
      .subscribe(created => {
        this.loadCategories();

        this.selectedParentCategoryId = created.id;
        this.selectedCategoryId = undefined;
        this.model.categoryId = undefined as any;

        this.newParentName = '';
        this.showAddParent = false;
      });
  }

  createChildCategory() {
    if (!this.newChildName.trim() || !this.selectedParentCategoryId) return;

    this.api.createCategory({
      categoryName: this.newChildName,
      parentCategoryId: this.selectedParentCategoryId
    }).subscribe(created => {
      this.loadCategories();

      this.selectedCategoryId = created.id;
      this.model.categoryId = created.id as any; // ✅ 同步
      this.newChildName = '';
      this.showAddChild = false;
    });
  }
  // =============================
  // FAQ 狀態切換
  // =============================
  resetToCreateMode() {
    this.isEditMode = false;
    this.selectedParentCategoryId = undefined;
    this.selectedCategoryId = undefined;

    this.model = {
      categoryId: undefined as any,
      question: '',
      blocks: [{ blockType: 'TEXT', content: '' }]
    };
  }

  loadFaqForEdit(faqId: number) {
    this.api.getFaqForEdit(faqId).subscribe(faq => {
      this.model = faq;
      this.isEditMode = true;

      this.selectedCategoryId = faq.categoryId;
      this.model.categoryId = faq.categoryId;

      if (!this.model.blocks || this.model.blocks.length === 0) {
        this.model.blocks = [{ blockType: 'TEXT', content: '' }];
      }
    });
  }
  onParentChange(parentId?: number) {
    this.selectedParentCategoryId = parentId;
    // 換大分類時，小分類一定要重選
    this.selectedCategoryId = undefined;
    this.model.categoryId = undefined as any;
  }
  onChildChange(categoryId?: number) {
    this.selectedCategoryId = categoryId;
    this.model.categoryId = categoryId as any;

    // 🔥 載入該分類底下 FAQ
    if (categoryId) {
      this.api.getFaqsByCategory(categoryId).subscribe(list => {
        this.faqs = list;
      });
    } else {
      this.faqs = [];
      this.resetToCreateMode();
    }
  }
  // =============================
  // Blocks
  // =============================
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
        { blockType: 'TEXT', content: '' }
      );
      this.uploading = false;
    });

    input.value = '';
  }

  removeBlock(index: number) {
    const blocks = this.model.blocks;
    const textCount = blocks.filter(b => b.blockType === 'TEXT').length;

    if (blocks[index].blockType === 'TEXT' && textCount <= 1) {
      alert('至少需要一個文字區塊');
      return;
    }

    blocks.splice(index, 1);
  }

  // =============================
  // 儲存 / 刪除
  // =============================
  save() {
    if (!this.model.categoryId && this.selectedCategoryId) {
      this.model.categoryId = this.selectedCategoryId as any;
    }

    if (!this.model.categoryId) {
      alert('請先選擇分類');
      return;
    }

    if (!this.model.blocks.some(b => b.blockType === 'TEXT')) {
      alert('至少需要一個文字區塊');
      return;
    }

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
      alert(this.isEditMode ? 'FAQ 已更新' : 'FAQ 已新增');
      this.resetToCreateMode();
    });
  }

  deleteFaq() {
    if (!this.model.faqId) return;
    if (!confirm('確定要刪除這筆 FAQ？')) return;

    const deletedId = this.model.faqId;

    this.api.deleteFaq(deletedId).subscribe(() => {
      alert('FAQ 已刪除');

      // 🔥 從清單移除
      this.faqs = this.faqs.filter(f => f.faQid !== deletedId);

      this.resetToCreateMode();
    });
  }
  deleteCategory(categoryId?: number) {
    if (!categoryId) return;

    const target = this.categories.find(c => c.id === categoryId);
    const name = target?.categoryName ?? `ID=${categoryId}`;

    const ok = confirm(`確定要刪除分類：${name} ？`);
    if (!ok) return;

    this.api.deleteCategory(categoryId).subscribe({
      next: () => {
        // 1) 從列表移除
        this.categories = this.categories.filter(c => c.id !== categoryId);

        // 2) 如果刪的是目前選的「小分類」，清掉
        if (this.selectedCategoryId === categoryId) {
          this.selectedCategoryId = undefined;
          // 如果你的 FAQ model 用 categoryId 綁小分類，也要一起清
          this.model.categoryId = undefined as any; // 你若用 undefined 就改成 undefined
        }

        // 3) 如果刪的是目前選的「大分類」，清掉大分類與小分類
        if (this.selectedParentCategoryId === categoryId) {
          this.selectedParentCategoryId = undefined;
          this.selectedCategoryId = undefined;
          this.model.categoryId = undefined as any;
        }

        alert('分類已刪除');
      },
      error: (err) => {
        console.error(err);

        const raw = err?.error?.message as string | undefined;

        const msg = raw === 'Category has sub categories'
          ? '刪除失敗：此大分類底下還有小分類，請先刪除小分類。'
          : raw === 'Category has FAQs'
            ? '刪除失敗：此分類底下還有 FAQ，請先刪除 FAQ。'
            : raw || '刪除失敗，請稍後再試。';

        alert(msg);
      }
    });
  }
}
