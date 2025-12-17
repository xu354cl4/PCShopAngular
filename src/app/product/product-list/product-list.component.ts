import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ProductFilterComponent } from '../product-filter/product-filter.component';
import { ProductFilter } from '../models/product-filter.model';
import { Product } from '../models/product.model';
import { ProductService, ApiResponse } from '../services/product.service'; // 匯入 ApiResponse

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ProductFilterComponent],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {

  pagedProducts: Product[] = [];
  totalItems = 0;

  searchKeyword = '';
  sortBy = 'name';
  itemsPerPageOptions = [5, 10, 15];
  itemsPerPage = 5;
  currentPage = 1;
  totalPages = 1;
  displayPages: (number | string)[] = [];

  activeFilter: ProductFilter = {
    minPrice: null,
    maxPrice: null,
    categories: []  // 篩選器選的分類
  };

  loading = false;

  constructor(private productService: ProductService) { }

  ngOnInit(): void {
    this.fetchProducts(); // 初始化抓商品
  }

  // ProductFilterComponent 發出事件時觸發
  onFilterChange(filter: ProductFilter): void {
    this.activeFilter = filter;
    this.currentPage = 1; // 篩選後回到第1頁
    this.fetchProducts();
  }

  // 抓取商品列表
  fetchProducts(): void {
    this.loading = true;

    this.productService.getProducts(
      this.searchKeyword,
      this.currentPage,
      this.itemsPerPage,
      this.sortBy,
      this.activeFilter.categories,           // 傳送篩選器選的分類
      this.activeFilter.minPrice ?? undefined,
      this.activeFilter.maxPrice ?? undefined
    ).subscribe({
      next: (res: ApiResponse<Product[]>) => {
        // 使用 res.data 取得商品列表
        this.pagedProducts = res.data || [];

        // 使用 res.totalItems 更新總筆數
        this.totalItems = res.totalItems || 0;

        // 分頁計算
        this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
        if (this.currentPage > this.totalPages) this.currentPage = this.totalPages || 1;
        this.generateDisplayPages();

        if (res.message) console.log(res.message);
      },
      error: err => {
        console.error('取得產品資料失敗', err);
        this.pagedProducts = [];
        this.totalItems = 0;
        this.totalPages = 1;
      },
      complete: () => this.loading = false
    });
  }

  onClickPage(p: number | string): void {
    if (typeof p === 'string') return;
    this.changePage(p);
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.fetchProducts();
  }

  changeItemsPerPage(): void {
    this.currentPage = 1;
    this.fetchProducts();
  }

  private generateDisplayPages(): void {
    const pages: (number | string)[] = [];
    const startPage = Math.max(1, this.currentPage - 2);
    const endPage = Math.min(this.totalPages, this.currentPage + 2);

    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) pages.push('...');
    }

    for (let i = startPage; i <= endPage; i++) pages.push(i);

    if (endPage < this.totalPages) {
      if (endPage < this.totalPages - 1) pages.push('...');
      pages.push(this.totalPages);
    }

    this.displayPages = pages;
  }
}
