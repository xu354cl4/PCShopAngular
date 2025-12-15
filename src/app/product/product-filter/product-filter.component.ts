import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductFilter } from '../models/product-filter.model';

@Component({
  selector: 'app-product-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-filter.component.html',
  styleUrls: ['./product-filter.component.css']
})
export class ProductFilterComponent implements OnInit {

  @Output() filterChange = new EventEmitter<ProductFilter>();

  // 篩選條件
  filter: ProductFilter = {
    minPrice: null,
    maxPrice: null,
    categories: []
  };

  categories: string[] = ['Watches', 'Phones', 'Headphones', 'TV', 'Speaker', 'Camera', 'Laptop'];

  ngOnInit(): void {
    this.emitFilterChange();
  }

  /** 切換分類選項 */
  toggleCategory(category: string, checked: boolean): void {
    if (!this.filter.categories) this.filter.categories = [];

    if (checked) {
      if (!this.filter.categories.includes(category)) {
        this.filter.categories.push(category);
      }
    } else {
      this.filter.categories = this.filter.categories.filter(c => c !== category);
    }

    this.emitFilterChange();
  }

  /** 更新價格範圍 */
  updatePrice(): void {
    // null 安全處理：將 undefined 或非數字轉為 null
    this.filter.minPrice = this.filter.minPrice != null && !isNaN(this.filter.minPrice) ? this.filter.minPrice : null;
    this.filter.maxPrice = this.filter.maxPrice != null && !isNaN(this.filter.maxPrice) ? this.filter.maxPrice : null;

    this.emitFilterChange();
  }

  /** 重設篩選條件 */
  resetFilter(): void {
    this.filter = {
      minPrice: null,
      maxPrice: null,
      categories: []
    };
    this.emitFilterChange();
  }

  /** 發送篩選條件給父組件 */
  private emitFilterChange(): void {
    this.filterChange.emit({ ...this.filter });
  }
}
