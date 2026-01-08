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

        // 1. 取得訂單詳情 (為了金額和品名)
        this.orderService.getOrderDetail(Number(this.orderId)).subscribe({
            next: (order) => {
                console.log('取得訂單資訊成功:', order);

                // 處理品名，ECPay 品名若有多項通常用 # 分隔
                let itemName = 'PcShop 商品';
                if (order.items && order.items.length > 0) {
                    itemName = order.items.map((i: OrderItemDto) => i.productName || '商品').join('#');
                }

                const orderData = {
                    OrderId: this.orderId!,
                    TotalAmount: order.totalAmount,
                    ItemName: itemName,
                    TradeDesc: 'PcShop 訂單付款'
                };

                // 2. 取得 ECPay 參數並提交表單
                this.ecpayService.getPaymentParams(orderData).subscribe({
                    next: (params) => {
                        console.log('取得 ECPay 參數:', params);
                        const form = document.createElement('form');
                        form.method = 'POST';
                        form.action = 'https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5';

                        for (const key in params) {
                            if (params.hasOwnProperty(key)) {
                                const hiddenField = document.createElement('input');
                                hiddenField.type = 'hidden';
                                hiddenField.name = key;
                                hiddenField.value = params[key];
                                form.appendChild(hiddenField);
                            }
                        }
                        document.body.appendChild(form);
                        form.submit();
                    },
                    error: (err) => {
                        console.error('取得 ECPay 參數失敗', err);
                        alert('金流初始化失敗，請稍後再試。');
                    }
                });
            },
            error: (err) => {
                console.error('取得訂單失敗', err);
                alert('無法取得訂單資訊，請洽客服。');
            }
        });
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
                    unitPrice: i.priceAtPurchase || 0,
                    imageUrl: i.imageUrl || 'assets/images/default-product.png',
                    quantity: i.quantity || 0
                }));

                this.showDetails = true;
            },
            error: (err) => {
                console.error('取得訂單詳情失敗', err);
                alert('暫時無法取得訂單明細，請稍後再試。');
            }
        });
    }
}

