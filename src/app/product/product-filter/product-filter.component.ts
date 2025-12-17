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

  minPrice: number | null = null;
  maxPrice: number | null = null;

  // 從後端抓取的分類列表
  categories: { name: string, checked: boolean }[] = [];

  constructor(private productService: ProductService) { }

  ngOnInit(): void {
    // 從後端 API 取得分類列表
    this.productService.getCategories().subscribe({
      next: (res: ApiResponse<{ id: number, name: string }[]>) => {
        // 修改: 從後端資料生成本地 categories 陣列
        this.categories = (res.data || []).map(c => ({
          name: c.name,
          checked: false
        }));
      },
      error: (err) => console.error('取得分類失敗', err)
    });
  }

  onFilterChange(): void {
    const selectedCategories = this.categories
      .filter(c => c.checked)
      .map(c => c.name);

    this.filterChange.emit({
      minPrice: this.minPrice,
      maxPrice: this.maxPrice,
      categories: selectedCategories
    });
  }

  resetFilter(): void {
    this.minPrice = null;
    this.maxPrice = null;
    this.categories.forEach(c => c.checked = false);
    this.onFilterChange();
  }
}
