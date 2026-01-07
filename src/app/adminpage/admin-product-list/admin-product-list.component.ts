import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminProductService } from '../services/admin-product.service';
import {
  AdminProductDto,
  AdminProductListDto,
  ProductSkuDto
} from '../models/admin-product.model';

@Component({
  selector: 'app-admin-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-product-list.component.html',
  styleUrls: ['./admin-product-list.component.css']
})
export class AdminProductListComponent implements OnInit {

  // ------------------------
  // 商品列表
  // ------------------------
  products: AdminProductListDto[] = [];
  filteredProducts: AdminProductListDto[] = [];
  paginatedProducts: AdminProductListDto[] = [];
  loading = false;
  errorMessage = '';

  // ------------------------
  // 搜尋 + 分頁
  // ------------------------
  searchText = '';
  currentPage = 1;
  pageSize = 20;
  totalPages = 1;
  pagesArray: number[] = [];

  // ------------------------
  // modal 狀態
  // ------------------------
  showModal = false;
  isEditing = false;
  currentProduct: AdminProductDto = this.createEmptyProduct();

  // ------------------------
  // 分類列表
  // ------------------------
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
        this.applySearch();
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
  // 搜尋功能
  // ------------------------
  applySearch(): void {
    const text = this.searchText.trim().toLowerCase();
    this.filteredProducts = text
      ? this.products.filter(p => p.productName.toLowerCase().includes(text))
      : [...this.products];

    this.currentPage = 1;
    this.updatePagination();
  }

  clearSearch(): void {
    this.searchText = '';
    this.applySearch();
  }

  // ------------------------
  // 分頁功能
  // ------------------------
  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredProducts.length / this.pageSize);
    this.pagesArray = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    this.paginate();
  }

  paginate(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    this.paginatedProducts = this.filteredProducts.slice(start, start + this.pageSize);
  }

  goPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.paginate();
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
        this.currentProduct.categoryId = category.categoryId;
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
      imageUrl: product.imageUrl,
      skus: []
    };

    this.adminProductService.getProduct(product.productId!).subscribe({
      next: dto => {
        this.currentProduct.fullDescription = dto.fullDescription;
        this.currentProduct.warrantyInfo = dto.warrantyInfo;
      },
      error: err => console.error(err)
    });

    this.adminProductService.getSkus(product.productId!).subscribe({
      next: skus => this.currentProduct.skus = skus ?? [],
      error: err => console.error('載入 SKU 失敗', err)
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
          alert('商品更新成功！');
          this.showModal = false;
          this.loadProducts();
        },
        error: err => alert('商品更新失敗')
      });
    } else {
      this.adminProductService.createProduct(this.currentProduct).subscribe({
        next: () => {
          alert('商品新增成功！');
          this.showModal = false;
          this.loadProducts();
        },
        error: err => alert('商品新增失敗')
      });
    }
  }

  // ------------------------
  // 刪除商品
  // ------------------------
  deleteProduct(productId: number): void {
    if (!confirm('確定要刪除這個商品嗎？')) return;
    this.adminProductService.deleteProduct(productId).subscribe({
      next: () => {
        this.products = this.products.filter(p => p.productId !== productId);
        this.applySearch();
      },
      error: err => alert('刪除商品失敗')
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
      error: err => alert('圖片上傳失敗')
    });
  }

  // ------------------------
  // SKU 操作
  // ------------------------
  addSku(): void {
    this.currentProduct.skus = this.currentProduct.skus ?? [];
    this.currentProduct.skus.push({
      skuid: 0,
      skuname: '',
      stockQuantity: 0,
      isOutOfStock: false,
      isOnSale: true,
      priceAdjustment: 0
    });
  }

  saveSku(sku: ProductSkuDto): void {
    if (!this.currentProduct.productId) return;
    if (sku.skuid && sku.skuid > 0) {
      this.adminProductService.updateSku(sku).subscribe({
        next: () => alert('SKU 更新成功'),
        error: err => alert('SKU 更新失敗')
      });
    } else {
      this.adminProductService.createSku(this.currentProduct.productId, sku).subscribe({
        next: res => {
          sku.skuid = res.skuid;
          alert('SKU 新增成功');
        },
        error: err => alert('SKU 新增失敗')
      });
    }
  }

  deleteSku(index: number): void {
    const sku = this.currentProduct.skus?.[index];
    if (!sku) return;

    if (sku.skuid && sku.skuid > 0) {
      this.adminProductService.deleteSku(sku.skuid).subscribe({
        next: () => {
          this.currentProduct.skus!.splice(index, 1);
          alert('SKU 刪除成功');
        },
        error: err => alert('SKU 刪除失敗')
      });
    } else {
      this.currentProduct.skus!.splice(index, 1);
    }
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
      imageUrl: '',
      skus: []
    };
  }

  // ------------------------
  // 狀態文字
  // ------------------------
  getStatusText(status: number): string {
    return status === 1 ? '上架' : '下架';
  }
}
