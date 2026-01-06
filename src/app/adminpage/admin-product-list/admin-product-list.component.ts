import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminProductService } from '../services/admin-product.service';
import { AdminProductDto, AdminProductListDto } from '../models/admin-product.model';

@Component({
  selector: 'app-admin-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-product-list.component.html',
  styleUrls: ['./admin-product-list.component.css']
})
export class AdminProductListComponent implements OnInit {

  // 商品列表
  products: AdminProductListDto[] = [];
  loading = false;
  errorMessage = '';

  // modal 狀態
  showModal = false;
  isEditing = false;
  currentProduct: AdminProductDto = this.createEmptyProduct();

  // 分類列表
  categories: { categoryId: number; categoryName: string }[] = [];
  newCategoryName = '';

  constructor(private adminProductService: AdminProductService) { }

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
  }

  // ------------------------
  // 載入商品列表
  // ------------------------
  loadProducts(): void {
    this.loading = true;
    this.adminProductService.getProducts().subscribe({
      next: data => {
        this.products = data;
        this.loading = false;
      },
      error: err => {
        console.error(err);
        this.errorMessage = '商品列表載入失敗';
        this.loading = false;
      }
    });
  }

  // ------------------------
  // 載入分類列表
  // ------------------------
  loadCategories(): void {
    this.adminProductService.getCategories().subscribe({
      next: data => this.categories = data,
      error: err => console.error('載入分類失敗', err)
    });
  }

  // ------------------------
  // 新增分類
  // ------------------------
  addCategory(): void {
    const name = this.newCategoryName.trim();
    if (!name) return;

    this.adminProductService.createCategory({ categoryName: name }).subscribe({
      next: category => {
        this.categories.push(category);
        this.currentProduct.categoryId = category.categoryId; // 新增後自動選中
        this.newCategoryName = '';
      },
      error: err => console.error('新增分類失敗', err)
    });
  }

  // ------------------------
  // 開啟 modal
  // ------------------------
  openCreateModal(): void {
    this.isEditing = false;
    this.currentProduct = this.createEmptyProduct();
    this.showModal = true;
  }

  openEditModal(product: AdminProductListDto): void {
    this.isEditing = true;
    this.currentProduct = {
      productId: product.productId,
      productName: product.productName,
      categoryId: product.categoryId,
      categoryName: product.categoryName,
      basePrice: product.basePrice,
      status: product.status,
      fullDescription: '',
      warrantyInfo: '',
      imageUrl: product.imageUrl
    };

    this.adminProductService.getProduct(product.productId!).subscribe({
      next: dto => {
        this.currentProduct.fullDescription = dto.fullDescription;
        this.currentProduct.warrantyInfo = dto.warrantyInfo;
      },
      error: err => console.error(err)
    });

    this.showModal = true;
  }

  // ------------------------
  // 儲存商品
  // ------------------------
  saveProduct(): void {
    if (this.isEditing && this.currentProduct.productId) {
      this.adminProductService.updateProduct(this.currentProduct.productId, this.currentProduct).subscribe({
        next: () => {
          this.showModal = false;
          this.loadProducts();
        },
        error: err => console.error(err)
      });
    } else {
      this.adminProductService.createProduct(this.currentProduct).subscribe({
        next: () => {
          this.showModal = false;
          this.loadProducts();
        },
        error: err => console.error(err)
      });
    }
  }

  // ------------------------
  // 刪除商品
  // ------------------------
  deleteProduct(productId: number): void {
    if (!confirm('確定要刪除這個商品嗎？')) return;
    this.adminProductService.deleteProduct(productId).subscribe({
      next: () => this.products = this.products.filter(p => p.productId !== productId),
      error: err => console.error(err)
    });
  }

  // ------------------------
  // 圖片上傳
  // ------------------------
  onFileChange(event: any) {
    const file: File = event.target.files[0];
    if (!file) return;

    this.adminProductService.uploadImage(file).subscribe({
      next: res => this.currentProduct.imageUrl = res.imageUrl,
      error: err => console.error(err)
    });
  }

  // ------------------------
  // 建立空商品
  // ------------------------
  private createEmptyProduct(): AdminProductDto {
    return {
      productName: '',
      categoryId: 0,
      basePrice: 0,
      status: 1,
      fullDescription: '',
      warrantyInfo: '',
      imageUrl: ''
    };
  }

  // ------------------------
  // 狀態文字
  // ------------------------
  getStatusText(status: number): string {
    return status === 1 ? '上架' : '下架';
  }
}
