export interface ExternalLoginResponse {
  message: string;
  token: string;
  user: ExternalUser;
}

export type UserRole = 'User' | 'Admin';

export interface ExternalUser {
  userId: number;
  mail: string;
  fullName: string;
  imageUrl: string | null;
  profileCompleted: boolean;
  isMailVerified: boolean;
  provider?: string; // ⭐ 後端回傳的 Provider 來自 OAuth

  role?: UserRole; //這邊假設後端會回傳 目前沒有
}

