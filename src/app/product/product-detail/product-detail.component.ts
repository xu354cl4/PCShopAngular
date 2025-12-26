import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  data: T;
  totalItems?: number;
  message?: string;
}

export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  description: string;
  warrantyInfo: string;
  images: string[];
  rating: number;
}

export interface ProductSku {
  skuid: number;
  skuname: string;
  stockQuantity: number;
  isOutOfStock: boolean;
  isOnSale: boolean;
  priceAdjustment: number;
}

export interface AddToCartDto {
  skuid: number;
  quantity: number;
  userId: number;
}

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit {

  productId!: number;
  product?: Product;
  skus: ProductSku[] = [];
  selectedSku?: ProductSku;
  loading = true;
  loadingSkus = true;

  userId = 1;
  quantity = 1;
  quantityExceeded = false; // 是否超過庫存

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    this.productId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadProduct(this.productId);
    this.loadSkus(this.productId);
  }

  loadProduct(id: number): void {
    this.getProduct(id).subscribe({
      next: (product) => {
        this.product = product;
        this.loading = false;
      },
      error: (err) => {
        console.error('取得商品失敗', err);
        this.loading = false;
      }
    });
  }

  getProduct(id: number): Observable<Product> {
    return this.http
      .get<ApiResponse<Product>>(`https://localhost:7001/api/products/${id}`)
      .pipe(map(res => res.data));
  }

  loadSkus(productId: number): void {
    this.getSkus(productId).subscribe({
      next: (data) => {
        this.skus = data;
        if (this.skus.length > 0) {
          this.selectedSku = this.skus[0];
          this.quantity = 1;
        }
        this.loadingSkus = false;
      },
      error: (err) => {
        console.error('取得 SKU 失敗', err);
        this.loadingSkus = false;
      }
    });
  }

  getSkus(productId: number): Observable<ProductSku[]> {
    return this.http
      .get<ApiResponse<ProductSku[]>>(`https://localhost:7001/api/products/${productId}/skus`)
      .pipe(map(res => res.data));
  }

  selectSku(sku: ProductSku) {
    if (!sku.isOutOfStock) {
      this.selectedSku = sku;
      this.quantity = 1;
      this.quantityExceeded = false;
    }
  }

  isOutOfStock(sku: ProductSku): boolean {
    return sku.stockQuantity <= 0;
  }

  getSkuPrice(sku: ProductSku): number {
    return (this.product?.price || 0) + sku.priceAdjustment;
  }

  // 數量變化監控，超過庫存自動修正
  onQuantityChange() {
    if (this.selectedSku) {
      if (this.quantity > this.selectedSku.stockQuantity) {
        this.quantity = this.selectedSku.stockQuantity; // 自動修正
        this.quantityExceeded = true;
      } else {
        this.quantityExceeded = false;
      }

      if (this.quantity < 1) {
        this.quantity = 1;
      }
    }
  }

  addToCart() {
    if (!this.selectedSku) return;

    if (this.isOutOfStock(this.selectedSku)) {
      alert('此商品已缺貨，請選擇其他規格');
      return;
    }

    const dto: AddToCartDto = {
      skuid: this.selectedSku.skuid,
      quantity: this.quantity,
      userId: this.userId
    };

    this.http.post<ApiResponse<string>>(
      'https://localhost:7001/api/cart/add',
      dto
    ).subscribe({
      next: (res) => alert(res.message || '已成功加入購物車'),
      error: (err) => alert(err.error?.message || '加入購物車失敗')
    });
  }
}
