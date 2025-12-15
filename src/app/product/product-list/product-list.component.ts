import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ProductFilter } from '../models/product-filter.model';
import { ProductFilterComponent } from '../product-filter/product-filter.component';

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  rating: number;
  imageUrl: string;
}

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ProductFilterComponent],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {

  products: Product[] = [
    { id: 1, name: 'M75 Sport Watch', category: 'Watches', price: 320.99, rating: 4, imageUrl: 'assets/images/products/watch.jpg' },
    { id: 2, name: 'iPhone 12 Pro Max', category: 'Phones', price: 259.99, rating: 5, imageUrl: 'assets/images/products/iphone.jpg' },
    { id: 3, name: 'Gaming Headset', category: 'Headphones', price: 89.99, rating: 4, imageUrl: 'assets/images/products/headset.jpg' },
    { id: 4, name: 'Smart TV 55"', category: 'TV', price: 799.99, rating: 5, imageUrl: 'assets/images/products/tv.jpg' },
    { id: 5, name: 'Bluetooth Speaker', category: 'Speaker', price: 49.99, rating: 4, imageUrl: 'assets/images/products/speaker.jpg' },
    { id: 6, name: 'Ultra HD Camera', category: 'Camera', price: 450.00, rating: 5, imageUrl: 'assets/images/products/camera.jpg' },
    { id: 7, name: 'Wireless Headphones', category: 'Headphones', price: 150.00, rating: 5, imageUrl: 'assets/images/products/headset2.jpg' },
    { id: 8, name: 'Mini Bluetooth Speaker', category: 'Speaker', price: 70.00, rating: 4, imageUrl: 'assets/images/products/speaker2.jpg' },
    { id: 9, name: 'Apple MacBook Air', category: 'Laptop', price: 899.00, rating: 5, imageUrl: 'assets/images/products/laptop.jpg' },
    { id: 10, name: 'M75 Sport Watch', category: 'Watches', price: 320.99, rating: 4, imageUrl: 'assets/images/products/watch.jpg' },
    { id: 11, name: 'M75 Sport Watch', category: 'Watches', price: 320.99, rating: 4, imageUrl: 'assets/images/products/watch.jpg' },
    { id: 12, name: 'iPhone 12 Pro Max', category: 'Phones', price: 259.99, rating: 5, imageUrl: 'assets/images/products/iphone.jpg' },
    { id: 13, name: 'Gaming Headset', category: 'Headphones', price: 89.99, rating: 4, imageUrl: 'assets/images/products/headset.jpg' },
    { id: 14, name: 'Smart TV 55"', category: 'TV', price: 799.99, rating: 5, imageUrl: 'assets/images/products/tv.jpg' },
    { id: 15, name: 'Bluetooth Speaker', category: 'Speaker', price: 49.99, rating: 4, imageUrl: 'assets/images/products/speaker.jpg' },
    { id: 16, name: 'Ultra HD Camera', category: 'Camera', price: 450.00, rating: 5, imageUrl: 'assets/images/products/camera.jpg' },
    { id: 17, name: 'Wireless Headphones', category: 'Headphones', price: 150.00, rating: 5, imageUrl: 'assets/images/products/headset2.jpg' },
    { id: 18, name: 'Mini Bluetooth Speaker', category: 'Speaker', price: 70.00, rating: 4, imageUrl: 'assets/images/products/speaker2.jpg' },
    { id: 19, name: 'Apple MacBook Air', category: 'Laptop', price: 899.00, rating: 5, imageUrl: 'assets/images/products/laptop.jpg' },
    { id: 20, name: 'M75 Sport Watch', category: 'Watches', price: 320.99, rating: 4, imageUrl: 'assets/images/products/watch.jpg' },
    { id: 21, name: 'M75 Sport Watch', category: 'Watches', price: 320.99, rating: 4, imageUrl: 'assets/images/products/watch.jpg' },
    { id: 22, name: 'iPhone 12 Pro Max', category: 'Phones', price: 259.99, rating: 5, imageUrl: 'assets/images/products/iphone.jpg' },
    { id: 23, name: 'Gaming Headset', category: 'Headphones', price: 89.99, rating: 4, imageUrl: 'assets/images/products/headset.jpg' },
    { id: 24, name: 'Smart TV 55"', category: 'TV', price: 799.99, rating: 5, imageUrl: 'assets/images/products/tv.jpg' },
    { id: 25, name: 'Bluetooth Speaker', category: 'Speaker', price: 49.99, rating: 4, imageUrl: 'assets/images/products/speaker.jpg' },
    { id: 26, name: 'Ultra HD Camera', category: 'Camera', price: 450.00, rating: 5, imageUrl: 'assets/images/products/camera.jpg' },
    { id: 27, name: 'Wireless Headphones', category: 'Headphones', price: 150.00, rating: 5, imageUrl: 'assets/images/products/headset2.jpg' },
    { id: 28, name: 'Mini Bluetooth Speaker', category: 'Speaker', price: 70.00, rating: 4, imageUrl: 'assets/images/products/speaker2.jpg' },
    { id: 29, name: 'Apple MacBook Air', category: 'Laptop', price: 899.00, rating: 5, imageUrl: 'assets/images/products/laptop.jpg' },
    { id: 30, name: 'M75 Sport Watch', category: 'Watches', price: 320.99, rating: 4, imageUrl: 'assets/images/products/watch.jpg' },
  ];

  searchKeyword = '';
  sortBy = 'name';

  itemsPerPageOptions = [5, 10, 15];
  itemsPerPage = 5;

  currentPage = 1;
  totalPages = 1;
  pagedProducts: Product[] = [];
  displayPages: (number | string)[] = [];

  // filter 狀態
  activeFilter: ProductFilter = {
    minPrice: null,
    maxPrice: null,
    categories: []
  };

  ngOnInit(): void {
    this.updateProducts();
  }

  /** filter 變動時呼叫 */
  onFilterChange(filter: ProductFilter): void {
    this.activeFilter = filter;
    this.currentPage = 1;
    this.updateProducts();
  }

  /** 更新產品列表（搜尋 + 排序 + filter + 分頁） */
  updateProducts(): void {
    let filtered = [...this.products];

    // 搜尋
    if (this.searchKeyword.trim()) {
      const keyword = this.searchKeyword.toLowerCase();
      filtered = filtered.filter(p => p.name.toLowerCase().includes(keyword));
    }

    // 分類篩選
    if (this.activeFilter.categories && this.activeFilter.categories.length > 0) {
      filtered = filtered.filter(p => this.activeFilter.categories!.includes(p.category));
    }

    // 價格篩選
    if (this.activeFilter.minPrice != null) {
      filtered = filtered.filter(p => p.price >= this.activeFilter.minPrice!);
    }
    if (this.activeFilter.maxPrice != null) {
      filtered = filtered.filter(p => p.price <= this.activeFilter.maxPrice!);
    }

    // 排序
    switch (this.sortBy) {
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'priceAsc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'priceDesc':
        filtered.sort((a, b) => b.price - a.price);
        break;
    }

    // 分頁
    this.totalPages = Math.ceil(filtered.length / this.itemsPerPage);
    if (this.currentPage > this.totalPages) this.currentPage = this.totalPages || 1;
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.pagedProducts = filtered.slice(start, end);

    this.generateDisplayPages();
  }

  /** 分頁切換 */
  onClickPage(p: number | string): void {
    if (typeof p === 'string') return;
    this.changePage(p);
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updateProducts();
  }

  changeItemsPerPage(): void {
    this.itemsPerPage = Number(this.itemsPerPage);
    this.currentPage = 1;
    this.updateProducts();
  }

  /** 產生頁碼 */
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
}

