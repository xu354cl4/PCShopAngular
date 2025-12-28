import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // <--- 1. 引入
import { Router } from '@angular/router'; // 1. 引入 Router
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthStateService } from '../Services/auth-state.service';
import { take } from 'rxjs';
import { StepsModule } from 'primeng/steps';
import { MenuItem } from 'primeng/api';


// 1. 定義介面 (確保放在 @Component 之前) UserID(下拉選單)
export interface Coupon {
  userCouponID: number; // 新增：後端對應的 UserCouponID
  couponCode: string;
  name: string;
  discountType: string;
  discountValue: number;
  minOrderAmount: number;
  isActive: boolean;
  disabled?: boolean; // 新增：用於前端 UI 門檻判斷
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
  imports: [FormsModule, CommonModule, StepsModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})

export class CartComponent { // 2. 這裡不用寫 implements OnInit
  isAllSelected = false;

  // 新增：目前選中的折價券
  selectedCoupon: Coupon | null = null;
  couponCodeInput: string = ''; // 新增：折扣碼輸入框繫結

  // 改為空陣列，等待 API 回傳
  rawCoupons: Coupon[] = [];
  userId: number | null = null;

  // 結帳流程進度條
  steps: MenuItem[] = [];
  activeIndex: number = 0; // 購物車是第 1 步 (Index 0)


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

  constructor(
    private router: Router,
    private http: HttpClient,
    private authStateService: AuthStateService
  ) { }

  goToCheckout() {
    // 使用你剛剛寫好的 selectedCount 來檢查
    if (this.selectedCount === 0) {
      alert('請至少勾選一項商品才能結帳！');
      return; // 中斷執行，不跳轉
    }

    // 準備要傳遞到結帳頁面的資料
    const checkoutData = {
      selectedItems: this.cartItems.filter(item => item.selected),
      subTotal: this.subTotal,
      discountAmount: this.discountAmount,
      totalAmount: this.totalAmount,
      selectedCoupon: this.selectedCoupon
    };

    // 檢查通過，執行跳轉並帶入資料
    this.router.navigate(['/checkout'], { state: { data: checkoutData } });
  }

  //購物車清單//
  ngOnInit(): void {
    this.steps = [
      { label: '購物車' },
      { label: '填寫資料' },
      { label: '訂單確認' }
    ];

    // 取得使用者 ID
    this.authStateService.user$.pipe(take(1)).subscribe(user => {
      if (user) {
        this.userId = user.userId;
        this.loadCoupons();
        console.log(user);
      }
    });

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

  loadCoupons(): void {
    this.http.get<Coupon[]>(`https://localhost:7001/api/Cart/Coupons`).subscribe({
      next: (data) => {
        console.log(data);
        this.rawCoupons = data;
      },
      error: (err) => {
        console.error('載入折價券失敗', err);
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
      disabled: this.subTotal < coupon.minOrderAmount
    }));
  }

  // 折扣金額計算
  get discountAmount(): number {
    // 防呆：沒選券 或 未達低消 -> 折扣為 0
    if (!this.selectedCoupon || this.subTotal < this.selectedCoupon.minOrderAmount) {
      return 0;
    }

    // 取得折價券類型與數值
    const type = String(this.selectedCoupon.discountType || '').toLowerCase();
    const val = this.selectedCoupon.discountValue || 0;

    if (type === 'fixed' || type === '0' || type === 'amount') {
      // 1. 固定金額折扣
      return val;
    } else {
      // 2. 百分比/倍率折扣 (例如: 0.1 代表折扣 10%)

      // 如果數值大於 1 (例如 10 代表 10%)，則除以 100
      if (val > 1) {
        return Math.round(this.subTotal * (val / 100));
      }

      // 如果數值是 0.1 這種形式，直接作為折扣比例計算 (總額 * 0.1)
      // 若後端 0.9 代表 "9折" (即扣 10%)，請再告知我調整為 (1 - val)
      return Math.round(this.subTotal * val);
    }
  }

  // 最終金額
  get totalAmount(): number {
    console.log(this.subTotal, '減', this.discountAmount);
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

  // ★ 輔助驗證方法 (前端基礎驗證)
  validateCoupon(): void {
    if (this.selectedCoupon && this.subTotal < this.selectedCoupon.minOrderAmount) {
      this.selectedCoupon = null;
      alert('商品總額未達門檻，已取消折價券套用');
    }
  }

  // ★ 呼叫後端驗證折扣碼 (手動輸入)
  applyCouponCode(): void {
    const couponsCode = this.couponCodeInput.trim();
    if (!couponsCode) {
      alert('請輸入折扣碼');
      return;
    }

    // 根據需求呼叫 GET 端點
    this.http.get<Coupon>(`https://localhost:7001/api/Cart/Coupons/${couponsCode}`).subscribe({
      next: (coupon) => {
        if (!coupon) {
          alert('無效的折扣碼');
          return;
        }

        if (this.subTotal < coupon.minOrderAmount) {
          alert(`此折扣碼最低消費門檻為 NT$ ${coupon.minOrderAmount}，目前尚未達成。`);
          return;
        }

        // 成功套用
        this.selectedCoupon = coupon;

        // 如果這個手動輸入的券尚未在 rawCoupons 清單中，則加入
        const exists = this.rawCoupons.find(c => c.couponCode === coupon.couponCode);
        if (!exists) {
          this.rawCoupons = [...this.rawCoupons, coupon];
        }
        alert('折扣碼套用成功！');
      },
      error: (err) => {
        console.error('驗證折扣碼失敗', err);
        alert(err.error?.message || '無效的折扣碼或其門檻未達標');
      }
    });
  }

  // ★ 新增這個方法：用來告訴 HTML 如何比較兩個折價券
  // 放在類別的最後面即可
  compareCoupons(c1: Coupon, c2: Coupon): boolean {
    // 1. 如果兩個都是 null (代表選了不使用優惠券)，視為相同
    if (!c1 && !c2) return true;

    // 2. 如果其中一個有值，另一個沒值，視為不同
    if (!c1 || !c2) return false;

    // 3. 如果兩個都有值，比較它們的 code (唯一代碼) 是否相同
    return c1.couponCode === c2.couponCode;
  }

}







