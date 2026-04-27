export type RefreshTokenClaims = {
  sub: string;
  iat: number;
  exp: number;
};

export type AccessTokenClaims = RefreshTokenClaims & {
  role: 'USER' | 'ADMIN';
};
