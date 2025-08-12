export interface JwtPayload {
  sub: string; // User ID
  email: string;
  role: string;
  merchantId: string;
  iat?: number; // Issued at
  exp?: number; // Expiration time
}
