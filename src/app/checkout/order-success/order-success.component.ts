import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { EcpayService } from '../../Services/ecpay.service';
import { OrderApiService } from '../../Services/order-api.service';
import { OrderDetailDto, OrderItemDto } from '../../models/order-request.model';

@Component({
    selector: 'app-order-success',
    standalone: true,
    imports: [CommonModule, RouterModule, ButtonModule],
    templateUrl: './order-success.component.html',
    styleUrl: './order-success.component.css'
})
export class OrderSuccessComponent implements OnInit {
    orderId: string | null = null;
    status: 'waiting' | 'success' | 'failure' = 'waiting';
    orderItems: any[] = []; // 儲存商品明細 (用於顯示)
    orderDetail: OrderDetailDto | null = null; // 儲存完整訂單詳情
    showDetails: boolean = false; // 控制是否顯示明細
    activeIndex: number = 2; // 當前步驟索引 (訂單確認為第 3 步，索引為 2)

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private ecpayService: EcpayService,
        private orderService: OrderApiService
    ) { }

    ngOnInit(): void {
        this.orderId = this.route.snapshot.paramMap.get('orderId');

        // 檢查 URL 中是否有 ECPay 回傳的參數
        this.route.queryParams.subscribe(params => {
            const rtnCode = params['RtnCode'];
            if (rtnCode === '1') {
                this.status = 'success';
            } else if (rtnCode && rtnCode !== '1') {
                this.status = 'failure';
            } else {
                // 如果沒有 RtnCode，預設為等待付款 (訂單剛建立)
                this.status = 'waiting';
            }
        });
    }

    onPay(): void {
        if (!this.orderId) return;

        // 直接向後端請求此訂單的金流參數 (由後端封裝成 HTML 表單)
        this.ecpayService.getPaymentParams(Number(this.orderId)).subscribe({
            next: (response) => {
                if (response.success && response.htmlForm) {
                    console.log('取得 ECPay 表單，準備執行跳轉...');
                    this.executeEcpayForm(response.htmlForm);
                } else {
                    console.error('取得金流參數失敗:', response.message);
                    alert(response.message || '金流初始化失敗，請聯繫客服。');
                }
            },
            error: (err) => {
                console.error('取得 ECPay 參數失敗', err);
                alert('無法與金流系統連線，請稍後再試。');
            }
        });
    }

    /**
     * 執行綠界自動跳轉表單
     */
    private executeEcpayForm(htmlForm: string): void {
        // 建立臨時容器
        const div = document.createElement('div');
        div.style.display = 'none';
        div.innerHTML = htmlForm;
        document.body.appendChild(div);

        // 尋找表單並提交
        const form = div.querySelector('form');
        if (form) {
            form.submit();
        } else {
            console.error('HTML 中找不到表單元素');
            alert('系統錯誤：找不到支付表單');
        }
    }

    onViewOrder(): void {
        if (!this.orderId) return;

        // 取得完整訂單詳情 (包含收件資訊與商品清單)
        this.orderService.getOrderDetail(Number(this.orderId)).subscribe({
            next: (data: OrderDetailDto) => {
                console.log('取得訂單詳情成功:', data);
                this.orderDetail = data;

                // 資料標準化 (對應新定義的 OrderItemDto 欄位)
                this.orderItems = (data.items || []).map(i => ({
                    ...i,
                    productName: i.productName || '未知商品',
                    skuName: i.skuName || '',
                    unitPriceAtPurchase: i.unitPriceAtPurchase || 0,
                    imageUrl: i.productImage || 'assets/images/default-product.png',
                    quantity: i.quantity || 0
                }));
                console.log('訂單商品明細:', this.orderItems);

                this.showDetails = true;
            },
            error: (err) => {
                console.error('取得訂單詳情失敗', err);
                alert('暫時無法取得訂單明細，請稍後再試。');
            }
        });
    }
}

