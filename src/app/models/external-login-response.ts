export interface ExternalLoginResponse {
  message: string;
  token: string;
  user: ExternalUser;
}

export interface ExternalUser {
  userId: number;
  mail: string;
  fullName: string;
  imageUrl: string | null;
  profileCompleted: boolean;
}

