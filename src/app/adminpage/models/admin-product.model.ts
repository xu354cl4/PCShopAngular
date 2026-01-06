// 列表用 DTO（不包含 fullDescription, warrantyInfo）
export interface AdminProductListDto {
  productId: number;
  productName: string;
  categoryId: number;
  categoryName: string;
  basePrice: number;
  status: number;
  imageUrl: string;
}

// 編輯/新增用 DTO（包含完整欄位）
export interface AdminProductDto {
  productId?: number;          // 選填，用於更新
  productName: string;
  categoryId: number;
  categoryName?: string;       // 選填，只用於顯示
  basePrice: number;
  status: number;
  fullDescription: string;
  warrantyInfo: string;
  imageUrl: string;
}

export interface CategoryDto {
  categoryId: number;
  categoryName: string;
}
