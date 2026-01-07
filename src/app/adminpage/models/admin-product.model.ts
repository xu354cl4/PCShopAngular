// 列表用 DTO（不含 fullDescription, warrantyInfo）
export interface AdminProductListDto {
  productId: number;
  productName: string;
  categoryId: number;
  categoryName: string;
  basePrice: number;
  status: number;
  imageUrl: string;
}

// 編輯/新增用 DTO（含完整欄位 + SKU）
export interface AdminProductDto {
  productId?: number;        // 選填，用於更新
  productName: string;
  categoryId: number;
  categoryName?: string;     // 選填，只用於顯示
  basePrice: number;
  status: number;
  fullDescription: string;
  warrantyInfo: string;
  imageUrl: string;
  skus?: ProductSkuDto[];    // SKU 列表
}

// 商品分類 DTO
export interface CategoryDto {
  categoryId: number;
  categoryName: string;
}

// SKU DTO
export interface ProductSkuDto {
  skuid: number;
  skuname: string;
  stockQuantity: number;
  isOutOfStock: boolean;
  isOnSale: boolean;
  priceAdjustment: number;
}
