import { Component, AfterViewInit, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { forkJoin } from 'rxjs';

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
export class HomeComponent implements OnInit, AfterViewInit {

  /* =========================
     Hot Products（暫時硬寫 ID）
     ========================= */
  hotProductIds: number[] = [21, 22, 23];
  hotProducts: Product[] = [];
  loadingHot = false;
  errorHot = '';

  /* =========================
     Latest Products（真的最新）
     ========================= */
  latestProducts: Product[] = [];
  loadingLatest = false;
  errorLatest = '';

  constructor(
    private productService: ProductService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadHotProducts();
    this.loadLatestProducts();
  }

  /** 🔥 Hot Products：用商品 ID 一筆一筆抓（目前最安全） */
  loadHotProducts(): void {
    this.loadingHot = true;
    this.errorHot = '';

    // 用商品 ID 一筆一筆抓詳細
    const requests = this.hotProductIds.map(id =>
      this.productService.getProductDetail(id)
    );

    forkJoin(requests).subscribe({
      next: (responses: ApiResponse<any>[]) => {
        this.hotProducts = responses.map(r => ({
          id: r.data.id,
          name: r.data.name,
          category: r.data.category || '',
          rating: 0,  // Hot Products 暫不顯示
          price: r.data.price,
          salePrice: r.data.salePrice,   // <-- 這行最重要
          imageUrl: r.data.images?.[0] || '/images/no-image.png'
        }));
        this.loadingHot = false;
      },
      error: (err) => {
        console.error(err);
        this.errorHot = '載入 Hot Products 失敗';
        this.loadingHot = false;
      }
    });
  }


  /** ✨ Latest Products：最新 6 筆 */
  loadLatestProducts(): void {
    this.loadingLatest = true;
    this.errorLatest = '';

    this.productService.getLatestProducts(6).subscribe({
      next: (res: ApiResponse<Product[]>) => {
        this.latestProducts = res.data.map(p => {
          // 保留 base price 與 sale price
          return {
            ...p,
            salePrice: p.salePrice !== undefined ? p.salePrice : undefined
          } as Product;
        });
        this.loadingLatest = false;
      },
      error: (err) => {
        console.error(err);
        this.errorLatest = '載入最新商品失敗';
        this.loadingLatest = false;
      }
    });
  }

  goToProductDetail(productId: number): void {
    this.router.navigate(['/products', productId]);
  }

  ngAfterViewInit(): void {
    const carouselEl = document.querySelector('#carouselExampleInterval');
    if (carouselEl) {
      new bootstrap.Carousel(carouselEl, {
        interval: 3000
      });
    }
  }

  heartsClicked: boolean[] = [];

  toggleHeart(event: Event, index: number) {
    event.stopPropagation(); // 防止觸發卡片 click
    this.heartsClicked[index] = !this.heartsClicked[index];

    const target = event.target as HTMLElement;
    if (this.heartsClicked[index]) {
      target.classList.add('clicked');
      target.textContent = '❤️';
      setTimeout(() => target.classList.remove('clicked'), 500);
    } else {
      target.textContent = '🤍';
    }
  }
}
