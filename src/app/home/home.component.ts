import { Component, AfterViewInit, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ProductService, ApiResponse } from '../product/services/product.service';
import { Product } from '../product/models/product.model';

declare var bootstrap: any;

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements AfterViewInit, OnInit {

  hotProducts: Product[] = [];
  categories: { id: number; name: string }[] = [];
  loading = false;
  error = '';

  constructor(private productService: ProductService, private router: Router) { }

  ngOnInit(): void {
    this.loadHotProducts();
    this.loadCategories();
  }

  loadHotProducts(): void {
    this.loading = true;
    this.error = '';

    this.productService.getProducts('', 1, 3, 'sales')
      .subscribe({
        next: (res: ApiResponse<Product[]>) => {
          this.hotProducts = res.data.map(p => ({
            ...p,
            imageUrl: p.imageUrl
          }));
          this.loading = false;
        },
        error: (err) => {
          console.error('載入熱銷商品失敗', err);
          this.error = '載入熱銷商品失敗';
          this.loading = false;
        }
      });
  }

  loadCategories(): void {
    this.productService.getCategories().subscribe({
      next: (res: ApiResponse<{ id: number; name: string }[]>) => {
        this.categories = res.data || [];
      },
      error: (err) => {
        console.error('載入分類失敗', err);
        this.categories = [];
      }
    });
  }

  goToProductDetail(productId: number): void {
    this.router.navigate(['/products', productId]);
  }

  goToCategory(categoryName: string): void {
    // 多個分類也可用 , 分隔
    const queryParams = { categories: categoryName };
    this.router.navigate(['/products'], { queryParams });
  }

  ngAfterViewInit(): void {
    const carouselEl = document.querySelector('#carouselExampleInterval');
    if (carouselEl) {
      new bootstrap.Carousel(carouselEl, {
        ride: 'carousel',
        interval: 3000
      });
    }
  }
}
