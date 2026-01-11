import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { switchMap, takeUntil, finalize, tap } from 'rxjs/operators';

import { ProductFilterComponent } from '../product-filter/product-filter.component';
import { ProductFilter } from '../models/product-filter.model';
import { Product } from '../models/product.model';
import { ProductService, ApiResponse } from '../services/product.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ProductFilterComponent],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit, OnDestroy {

  pagedProducts: Product[] = [];
  totalItems = 0;

  searchKeyword = '';
  sortBy = 'name';

  itemsPerPageOptions = [5, 10, 15];
  itemsPerPage = 15;

  currentPage = 1;
  totalPages = 1;
  displayPages: (number | string)[] = [];

  activeFilter: ProductFilter = {
    minPrice: null,
    maxPrice: null,
    categories: []
  };

  loading = false;

  /** RxJS 觸發器 */
  private fetchTrigger$ = new Subject<void>();
  private destroy$ = new Subject<void>();

  constructor(private productService: ProductService) { }

  ngOnInit(): void {
    this.fetchTrigger$
      .pipe(
        tap(() => this.loading = true),
        switchMap(() =>
          this.productService.getProducts(
            this.searchKeyword,
            this.currentPage,
            this.itemsPerPage,
            this.sortBy,
            this.activeFilter.categories,
            this.activeFilter.minPrice ?? undefined,
            this.activeFilter.maxPrice ?? undefined
          ).pipe(finalize(() => this.loading = false))
        ),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (res: ApiResponse<Product[]>) => {
          this.pagedProducts = res.data || [];
          this.totalItems = res.totalItems || 0;

          this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
          if (this.currentPage > this.totalPages) {
            this.currentPage = this.totalPages || 1;
          }

          this.generateDisplayPages();
        },
        error: (err) => {
          console.error('取得產品資料失敗', err);
          this.pagedProducts = [];
          this.totalItems = 0;
          this.totalPages = 1;
        }
      });

    // 初始化載入一次
    this.triggerFetch();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /** 外部呼叫觸發搜尋 */
  triggerFetch(): void {
    this.fetchTrigger$.next();
  }

  /** 搜尋按鈕或 Enter */
  onSearchClick(): void {
    this.currentPage = 1;
    this.triggerFetch();
  }

  /** 篩選改變 */
  onFilterChange(filter: ProductFilter): void {
    this.activeFilter = filter;
    this.currentPage = 1;
    this.triggerFetch();
  }

  /** 分頁 */
  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.triggerFetch();
  }

  onClickPage(p: number | string): void {
    if (typeof p === 'string') return;
    this.changePage(p);
  }

  /** 每頁筆數改變 */
  changeItemsPerPage(): void {
    this.currentPage = 1;
    this.triggerFetch();
  }

  /** 計算分頁顯示 */
  private generateDisplayPages(): void {
    const pages: (number | string)[] = [];
    const startPage = Math.max(1, this.currentPage - 2);
    const endPage = Math.min(this.totalPages, this.currentPage + 2);

    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) pages.push('...');
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (endPage < this.totalPages) {
      if (endPage < this.totalPages - 1) pages.push('...');
      pages.push(this.totalPages);
    }

    this.displayPages = pages;
  }

  /** trackBy 避免閃爍 */
  trackByProductId(index: number, item: Product): number {
    return item.id;
  }
}
