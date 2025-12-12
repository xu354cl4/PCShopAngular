export interface ExternalLoginResponse {
  message: string;
  token: string;
  user: ExternalUser;
  profileCompleted: boolean;
}

export interface ExternalUser {
  userId: number;
  mail: string;
  fullName: string;
  imageUrl: string | null;
}
