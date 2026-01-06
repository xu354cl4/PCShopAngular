import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // <--- 1. 引入
import { Router, RouterModule } from '@angular/router'; // 1. 引入 Router
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
  productId: number; // 新增：對應後端 ProductID
  name: string;
  spec: string;
  price: number;
  quantity: number;
  imageUrl: string;
  selected: boolean;
}

export interface UserPoints {
  totalAvailablePoints: number;
  soonExpiringPoints: number;
}




@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [FormsModule, CommonModule, StepsModule, RouterModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})

export class CartComponent implements OnInit {
  isAllSelected = false;

  // 新增：目前選中的折價券
  selectedCoupon: Coupon | null = null;
  couponCodeInput: string = ''; // 新增：折扣碼輸入框繫結

  // 改為空陣列，等待 API 回傳
  rawCoupons: Coupon[] = [];
  userId: number | null = null;
  userPoints: UserPoints = { totalAvailablePoints: 0, soonExpiringPoints: 0 }; // 修改：使用介面
  usePoints: number = 0; // 用戶輸入要使用的點數

  // 結帳流程進度條
  steps: MenuItem[] = [];
  activeIndex: number = 0; // 購物車是第 1 步 (Index 0)

  cartItems: CartItem[] = [];

  constructor(
    private router: Router,
    private http: HttpClient,
    private authStateService: AuthStateService
  ) { }

  goToCheckout() {
    console.log('準備結帳，當前商品數量:', this.cartItems.length);
    console.log('選中商品數量:', this.selectedCount);

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
      usePoints: this.usePoints, // 新增：傳遞使用的點數
      totalAmount: this.totalAmount,
      selectedCoupon: this.selectedCoupon
    };

    console.log('跳轉資料:', checkoutData);

    // 檢查通過，執行跳轉並帶入資料
    this.router.navigate(['/checkout'], { state: { data: checkoutData } })
      .then(success => {
        if (success) {
          console.log('導覽至 checkout 成功');
        } else {
          console.warn('導覽至 checkout 失敗');
        }
      })
      .catch(err => {
        console.error('導覽過程中發生錯誤:', err);
      });
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
        this.loadUserPoints(); // 新增：載入點數
        console.log(user);
      }
    });

    this.http.get<CartItem[]>('https://localhost:7001/api/Cart').subscribe({
      next: (data) => {
        console.log('購物車 API 回傳:', data);
        const rawItems = Array.isArray(data) ? data : [];

        // 修正圖片路徑：若是相對路徑則補上 API 前綴
        this.cartItems = rawItems.map(item => ({
          ...item,
          imageUrl: item.imageUrl
            ? (item.imageUrl.startsWith('http') ? item.imageUrl : `https://localhost:7001${item.imageUrl}`)
            : 'https://localhost:7001/images/products/noimage.jpg',
          selected: item.selected ?? false
        }));

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

  // 新增：載入點數 API
  loadUserPoints(): void {
    if (this.userId) {
      this.http.get<UserPoints>(`https://localhost:7001/api/Cart/Points`).subscribe({
        next: (points) => {
          this.userPoints = points;
          console.log('載入點數成功:', points);
        },
        error: (err) => {
          console.error('載入點數失敗', err);
        }
      });
    }
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

  // 最終金額 (小計 - 折扣碼 - 點數)
  get totalAmount(): number {
    console.log(this.subTotal, '減', this.discountAmount, '再減', this.usePoints);
    const final = this.subTotal - this.discountAmount - this.usePoints;
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

  // ★ 新增：當下拉選單切換時
  onCouponChange(): void {
    // 如果選中「不使用優惠券」(null)，清空折扣碼輸入框
    if (this.selectedCoupon === null) {
      this.couponCodeInput = '';
    }
  }

  // ★ 新增/修正：驗證點數
  onPointsInput(event?: any): void {
    // 1. 基本數值處理 (防止 null, undefined 或非數字)
    if (this.usePoints === null || this.usePoints === undefined) {
      this.usePoints = 0;
    }

    // 2. 限制：不能為負數
    if (this.usePoints < 0) {
      this.usePoints = 0;
    }

    // 3. 限制：不能超過使用者持有的點數上限
    const maxAvailable = this.userPoints.totalAvailablePoints || 0;

    // 計算剩餘應付金額上限 (不能扣到負數)
    const remainingAmount = this.subTotal - this.discountAmount;
    const maxAllowedByTotal = remainingAmount > 0 ? remainingAmount : 0;

    // 最終限制：點數上限 與 剩餘金額 的較小值
    const ultimateMax = Math.min(maxAvailable, maxAllowedByTotal);

    if (this.usePoints > ultimateMax) {
      this.usePoints = ultimateMax;
    }

    // 確保輸入的是整數
    this.usePoints = Math.floor(this.usePoints);

    // 強制更新 DOM 元素的值 (關鍵：解決 Angular 模型沒變時 DOM 不更新的問題)
    if (event && event.target) {
      event.target.value = this.usePoints;
    }

    if (!this.userId) return;

    // 4. 呼叫後端驗證
    this.http.post<any>('https://localhost:7001/api/Cart/ValidatePoints', {
      userId: this.userId,
      usePoints: this.usePoints,
      subTotal: remainingAmount
    }).subscribe({
      next: (res) => {
        if (res && typeof res.validPoints === 'number') {
          this.usePoints = res.validPoints;
          // 若後端回傳的跟目前不同，再次同步 DOM
          if (event && event.target && event.target.value != this.usePoints) {
            event.target.value = this.usePoints;
          }
        }
      },
      error: (err) => {
        console.error('點數驗證 API 錯誤:', err);
      }
    });
  }
}







