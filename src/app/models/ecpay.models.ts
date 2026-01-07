// 定義與後端 ECPayDTO 對應的介面 //這個應該要另外塞 到時候整理
export interface ECPayOrder {
  OrderId?: string;
  TotalAmount: number;
  ItemName: string;
  TradeDesc?: string;
}
