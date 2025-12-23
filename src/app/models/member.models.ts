export interface MemberOverview {
  profile: MemberProfile;
  latestOrders: MemberLatestOrder[];
}

export interface MemberProfile {
  fullName: string;
  birthDate: string | null;
  phone: string;
  email: string;
}

export interface MemberLatestOrder {
  orderNo: string;
  statusText: string;  // 待付款/配送中/已完成
  statusCode: string;  // pending/shipping/completed
  totalAmount: number;
}

export interface MemberProfileEdit {
  fullName: string;
  birthDate: string | null;
  phone: string;
}
