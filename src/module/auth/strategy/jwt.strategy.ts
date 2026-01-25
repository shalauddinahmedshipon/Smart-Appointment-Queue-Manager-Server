import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

export type JwtPayload = {
  id: string;
  email: string;

};

import { Request } from "express";

const cookieExtractor = (req: Request): string | null => {
  if (req && req.cookies) {
    return req.cookies["access_token"] ?? null;
  }
  return null;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        cookieExtractor, // 🔥 ADD THIS
      ]),
      secretOrKey: process.env.ACCESS_TOKEN_SECRET as string,
      ignoreExpiration: false,
    });
  }

  async validate(payload: JwtPayload) {
    return payload;
  }
}
