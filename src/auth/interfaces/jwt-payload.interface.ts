export interface JwtPayload {
  sub: string; // User ID
  email: string;
  role: string;
  merchantId?: string;
  iat?: number;
  exp?: number;
}
