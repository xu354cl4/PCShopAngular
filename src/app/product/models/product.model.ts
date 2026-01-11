export interface Product {
  id: number;           // 對應 ProductId
  name: string;         // 對應 ProductName
  category: string;     // 對應 Category.CategoryName
  price: number;        // 對應 BasePrice
  salePrice?: number;   // <-- 新增這行，對應後端 SalePrice
  rating: number;       // 後端計算平均 ProductReviews.Rating
  imageUrl: string;     // 後端選擇主要 ProductImages.ImageUrl
}
