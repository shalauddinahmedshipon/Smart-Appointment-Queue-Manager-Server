// auth.utils.ts
import { JwtService } from '@nestjs/jwt';

export interface JwtPayload {
  id: string;
  email: string;
}

export async function getTokens(
  jwtService: JwtService,
  userId: string,
  email: string,
) {
  const payload: JwtPayload = { id: userId, email };

  // Option A – Recommended: let NestJS parse natural strings (most reliable)
  const expiresIn = process.env.ACCESS_TOKEN_EXPIREIN ?? '1d' as any;

  const accessToken = await jwtService.signAsync(payload, {
    secret: process.env.ACCESS_TOKEN_SECRET!,
    expiresIn,               // ← pass the string directly
  });

  return { accessToken };
}