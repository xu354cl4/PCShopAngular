import { Component, EventEmitter, Output } from '@angular/core';
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
export class ProductFilterComponent {

  @Output() filterChange = new EventEmitter<ProductFilter>();

  minPrice: number | null = null;
  maxPrice: number | null = null;
  categories: { name: string, checked: boolean }[] = [
    { name: 'Watches', checked: false },
    { name: 'Phones', checked: false },
    { name: 'Headphones', checked: false },
    { name: 'TV', checked: false },
    { name: 'Speaker', checked: false },
    { name: 'Camera', checked: false },
    { name: 'Laptop', checked: false },
  ];

  onFilterChange(): void {
    const selectedCategories = this.categories.filter(c => c.checked).map(c => c.name);
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
