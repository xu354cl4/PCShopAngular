export interface Product {
  id: number;           // 對應 ProductId
  name: string;         // 對應 ProductName
  category: string;     // 對應 Category.CategoryName
  price: number;        // 對應 BasePrice
  rating: number;       // 後端計算平均 ProductReviews.Rating
  imageUrl: string;     // 後端選擇主要 ProductImages.ImageUrl
}
