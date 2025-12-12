import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // <--- 1. 引入
import { FormsModule } from '@angular/forms';

export interface CartItem {
  id: number;
  name: string;
  spec: string;
  price: number;
  quantity: number;
  imageUrl: string;
  selected: boolean;
}

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})

export class CartComponent { // 2. 這裡不用寫 implements OnInit
  isAllSelected = false;
  // 模擬假資料：電腦周邊
  cartItems: CartItem[] = [
    {
      id: 1,
      name: 'Keychron K2 Pro 無線機械鍵盤',
      spec: '茶軸 / RGB / 鋁合金邊框',
      price: 3890,
      quantity: 1,
      imageUrl: 'https://via.placeholder.com/100x100/eeeeee/999999?text=Keyboard',
      selected: false
    },
    {
      id: 2,
      name: 'Logitech MX Master 3S 靜音滑鼠',
      spec: '珍珠白',
      price: 3290,
      quantity: 1,
      imageUrl: 'https://via.placeholder.com/100x100/eeeeee/999999?text=Mouse',
      selected: false
    },
    {
      id: 3,
      name: 'Type-C 編織傳輸線 2M',
      spec: '奶茶色',
      price: 490,
      quantity: 2,
      imageUrl: 'https://via.placeholder.com/100x100/eeeeee/999999?text=Cable',
      selected: false
    }
  ];

  constructor() { }

  ngOnInit(): void { }

  // 取得選取的總金額
  get totalAmount(): number {
    return this.cartItems
      .filter(item => item.selected)
      .reduce((acc, item) => acc + (item.price * item.quantity), 0);
  }

  // 取得選取的項目數量
  get selectedCount(): number {
    return this.cartItems.filter(item => item.selected).length;
  }

  // 全選/全不選
  toggleAll(): void {
    this.cartItems.forEach(item => item.selected = this.isAllSelected);
  }

  // 單選時檢查是否要勾選"全選"
  checkAllStatus(): void {
    this.isAllSelected = this.cartItems.every(item => item.selected) && this.cartItems.length > 0;
  }

  // 變更數量
  updateQty(item: CartItem, delta: number): void {
    const newQty = item.quantity + delta;
    if (newQty >= 1) {
      item.quantity = newQty;
    }
  }

  // 刪除
  removeItem(id: number): void {
    if (confirm('確定要將此商品移出購物車嗎？')) {
      this.cartItems = this.cartItems.filter(item => item.id !== id);
      this.checkAllStatus();
    }
  }
}

