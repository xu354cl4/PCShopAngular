import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterModule } from '@angular/router';
import { AuthStateService } from '../Services/auth-state.service';
import { Observable } from 'rxjs';
import { ExternalUser } from '../models/external-login-response';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
// 新增：商品 service
import { ProductService } from '../product/services/product.service';
import { CartService } from '../Services/cart.service';


@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterModule, CommonModule,],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  avatarUrl$!: Observable<string | null>;
  user$!: Observable<ExternalUser | null>;  // ⭐ 先宣告，不初始化
  // ===== 新增：分類 =====
  categories: { id: number; name: string }[] = [];
  loadingCategories = false;

  constructor(
    private authState: AuthStateService,
    private router: Router,
    private productService: ProductService,
    public cartService: CartService
  ) {
    this.user$ = this.authState.user$;      // ⭐ 這裡再接
    this.avatarUrl$ = this.authState.avatarUrl$;
  }


  // Header 初始化時載入分類
  ngOnInit(): void {
    this.loadCategories();
  }

  // ===== 分類 API =====
  loadCategories(): void {
    this.loadingCategories = true;

    this.productService.getCategories().subscribe({
      next: (res) => {
        this.categories = res.data;
        this.loadingCategories = false;
      },
      error: () => {
        this.loadingCategories = false;
      }
    });
  }

  // ===== 分類點擊導頁 =====
  goToCategory(categoryName: string): void {
    this.router.navigate(['/products'], {
      queryParams: { categories: categoryName }
    });
  }

  goRegister() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    this.authState.clear();   // ⭐ 非常重要
  }


  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.authState.clear();
  }
}
