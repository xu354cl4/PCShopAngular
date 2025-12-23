import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // <--- 1. 引入
import { Router } from '@angular/router'; // 1. 引入 Router
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';


// 1. 定義介面 (確保放在 @Component 之前)
export interface Coupon {
  code: string;
  name: string;
  type: 'amount' | 'percent';
  value: number;
  minSpend: number;
  disabled?: boolean;
}

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

  // 新增：目前選中的折價券
  selectedCoupon: Coupon | null = null;

  // 新增：折價券假資料
  rawCoupons: Coupon[] = [
    { code: 'SAVE100', name: '滿千折百', type: 'amount', value: 100, minSpend: 1000 },
    { code: 'VIP90', name: 'VIP 九折優惠', type: 'percent', value: 0.9, minSpend: 0 },
    { code: 'NEW50', name: '新戶折 $50', type: 'amount', value: 50, minSpend: 500 }
  ];


  // 模擬假資料：電腦周邊
  /*
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
  */
  cartItems: CartItem[] = [];

  constructor(private router: Router, private http: HttpClient) { }

  goToCheckout() {
    // 使用你剛剛寫好的 selectedCount 來檢查
    if (this.selectedCount === 0) {
      alert('請至少勾選一項商品才能結帳！');
      return; // 中斷執行，不跳轉
    }

    // 檢查通過，執行跳轉
    this.router.navigate(['/checkout']);
  }

  //購物車清單//
  ngOnInit(): void {
    this.http.get<CartItem[]>('https://localhost:7001/api/Cart').subscribe({
      next: (data) => {
        this.cartItems = data;
        // 確保所有從 API 來的資料都有 selected 狀態 (如果 API 沒給的話)
        this.cartItems.forEach(item => {
          if (item.selected === undefined) item.selected = false;
        });
        this.checkAllStatus();
      },
      error: (err) => {
        console.error('載入購物車失敗', err);
      }
    });
  }

  // 2. 修改：取得"商品小計" (尚未扣除折扣的金額)
  // 原本您的 totalAmount 邏輯移到這裡
  get subTotal(): number {
    return this.cartItems
      .filter(item => item.selected)
      .reduce((acc, item) => acc + (item.price * item.quantity), 0);
  }

  // ★ 修正重點：提供給 HTML 用的清單，包含 disabled 狀態
  get couponsList(): Coupon[] {
    return this.rawCoupons.map(coupon => ({
      ...coupon,
      disabled: this.subTotal < coupon.minSpend
    }));
  }

  // 折扣金額計算
  get discountAmount(): number {
    // 防呆：沒選券 或 未達低消 -> 折扣為 0
    if (!this.selectedCoupon || this.subTotal < this.selectedCoupon.minSpend) {
      return 0;
    }

    if (this.selectedCoupon.type === 'amount') {
      return this.selectedCoupon.value;
    } else {
      // 百分比折扣 (例如 0.9 折) -> 總額 * (1 - 0.9)
      return Math.round(this.subTotal * (1 - this.selectedCoupon.value));
    }
  }

  // 最終金額
  get totalAmount(): number {
    const final = this.subTotal - this.discountAmount;
    return final > 0 ? final : 0;
  }

  get selectedCount(): number {
    return this.cartItems.filter(item => item.selected).length;
  }

  toggleAll(): void {
    this.cartItems.forEach(item => item.selected = this.isAllSelected);
  }

  checkAllStatus(): void {
    this.isAllSelected = this.cartItems.length > 0 && this.cartItems.every(item => item.selected);
  }
  // ★ 變更數量 (您原本報錯的地方)
  updateQty(item: CartItem, delta: number): void {
    const newQty = item.quantity + delta;
    console.log(item);
    if (newQty >= 1) {
      // 呼叫 API 更新後端購物車數量
      this.http.post('https://localhost:7001/api/Cart/Update', {
        cartItemId: item.id,
        quantity: newQty
      }).subscribe({
        next: () => {
          // API 成功後再修改前端畫面
          item.quantity = newQty;
          // 數量變更可能導致金額不足低消，需重新驗證
          this.validateCoupon();
        },
        error: (err) => {
          console.error('更新數量失敗', err);
          // 這裡可以視需求加入報錯提示，例如：
          // alert('更新數量失敗，請稍重試');
        }
      });
    }
  }

  // ★ 刪除商品
  removeItem(id: number): void {
    console.log(`現在的id是${id}`);
    if (confirm('確定要將此商品移出購物車嗎？')) {
      this.http.delete(`https://localhost:7001/api/Cart/Delete/${id}`).subscribe({
        next: (response) => {
          console.log('商品已成功刪除', response);
          // API 成功後才過濾掉該商品並重新賦值，觸發 Angular 變更偵測
          this.cartItems = this.cartItems.filter(item => item.id !== id);

          // 更新全選狀態
          this.checkAllStatus();

          // 刪除後可能導致金額低於折價券門檻，需重新驗證
          this.validateCoupon();
        },
        error: (err) => {
          console.error('刪除商品過程中發生錯誤:', err);
          alert('刪除失敗，請檢查網路連線或稍後再試');
        }
      });
    }
  }

  // ★ 輔助驗證方法
  validateCoupon(): void {
    // 必須使用 this.subTotal (這是一個 getter)，不能直接用變數
    if (this.selectedCoupon && this.subTotal < this.selectedCoupon.minSpend) {
      this.selectedCoupon = null; // 取消選取
    }
  }

  // ★ 新增這個方法：用來告訴 HTML 如何比較兩個折價券
  // 放在類別的最後面即可
  compareCoupons(c1: Coupon, c2: Coupon): boolean {
    // 1. 如果兩個都是 null (代表選了不使用優惠券)，視為相同
    if (!c1 && !c2) return true;

    // 2. 如果其中一個有值，另一個沒值，視為不同
    if (!c1 || !c2) return false;

    // 3. 如果兩個都有值，比較它們的 code (唯一代碼) 是否相同
    return c1.code === c2.code;
  }

}







