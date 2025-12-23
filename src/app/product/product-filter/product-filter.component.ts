import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductFilter } from '../models/product-filter.model';
import { ProductService, ApiResponse } from '../services/product.service';

@Component({
  selector: 'app-product-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-filter.component.html',
  styleUrls: ['./product-filter.component.css']
})
export class ProductFilterComponent implements OnInit {

  @Output() filterChange = new EventEmitter<ProductFilter>();

  // 內部暫存價格，只有按套用時才 emit
  localMinPrice: number | null = null;
  localMaxPrice: number | null = null;

  // 從後端抓取的分類列表
  categories: { name: string, checked: boolean }[] = [];

  constructor(private productService: ProductService) { }

  ngOnInit(): void {
    // 從後端 API 取得分類列表
    this.productService.getCategories().subscribe({
      next: (res: ApiResponse<{ id: number, name: string }[]>) => {
        this.categories = (res.data || []).map(c => ({
          name: c.name,
          checked: false
        }));
      },
      error: (err) => console.error('取得分類失敗', err)
    });
  }

  /** 分類變動即時觸發 */
  onCategoryChange(): void {
    const selectedCategories = this.categories
      .filter(c => c.checked)
      .map(c => c.name);

    this.filterChange.emit({
      minPrice: this.localMinPrice,
      maxPrice: this.localMaxPrice,
      categories: selectedCategories
    });
  }

  /** 套用價格篩選 */
  applyPriceFilter(): void {
    const selectedCategories = this.categories
      .filter(c => c.checked)
      .map(c => c.name);

    this.filterChange.emit({
      minPrice: this.localMinPrice,
      maxPrice: this.localMaxPrice,
      categories: selectedCategories
    });
  }

  /** 重置篩選 */
  resetFilter(): void {
    this.localMinPrice = null;
    this.localMaxPrice = null;
    this.categories.forEach(c => c.checked = false);
    this.applyPriceFilter();
  }
}
