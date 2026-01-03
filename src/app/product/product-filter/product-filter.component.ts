import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService, ApiResponse } from '../services/product.service';

export interface ProductFilter {
  categories: string[];
  minPrice?: number | null;
  maxPrice?: number | null;
}

@Component({
  selector: 'app-product-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-filter.component.html',
  styleUrls: ['./product-filter.component.css']
})
export class ProductFilterComponent implements OnInit {

  @Output() filterChange = new EventEmitter<ProductFilter>();

  availableCategories: { id: number; name: string }[] = [];
  selectedCategories: string[] = [];

  minPrice?: number | null;
  maxPrice?: number | null;

  constructor(
    private productService: ProductService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadCategories();

    // 從 URL 同步勾選
    this.route.queryParamMap.subscribe(params => {
      const catParam = params.get('categories');
      this.selectedCategories = catParam ? catParam.split(',') : [];
      const min = params.get('minPrice');
      const max = params.get('maxPrice');
      this.minPrice = min ? +min : null;
      this.maxPrice = max ? +max : null;

      this.emitFilter();
    });
  }

  loadCategories(): void {
    this.productService.getCategories().subscribe({
      next: (res: ApiResponse<{ id: number; name: string }[]>) => {
        this.availableCategories = res.data || [];
      },
      error: err => console.error('取得分類失敗', err)
    });
  }

  toggleCategory(catName: string): void {
    const idx = this.selectedCategories.indexOf(catName);
    if (idx > -1) {
      this.selectedCategories.splice(idx, 1);
    } else {
      this.selectedCategories.push(catName);
    }
    this.updateUrl();
    this.emitFilter();
  }

  clear(): void {
    this.selectedCategories = [];
    this.minPrice = null;
    this.maxPrice = null;
    this.updateUrl();
    this.emitFilter();
  }

  applyPrice(): void {
    this.updateUrl();
    this.emitFilter();
  }

  private emitFilter(): void {
    this.filterChange.emit({
      categories: this.selectedCategories,
      minPrice: this.minPrice,
      maxPrice: this.maxPrice
    });
  }

  private updateUrl(): void {
    const query: any = {};
    if (this.selectedCategories.length) query.categories = this.selectedCategories.join(',');
    if (this.minPrice != null) query.minPrice = this.minPrice;
    if (this.maxPrice != null) query.maxPrice = this.maxPrice;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: query,
      queryParamsHandling: 'merge'
    });
  }

  isSelected(catName: string): boolean {
    return this.selectedCategories.includes(catName);
  }
}
