export interface ProductFilter {
  minPrice: number | null;      // 最低價
  maxPrice: number | null;      // 最高價
  categories: string[];         // 選取的商品分類
}
