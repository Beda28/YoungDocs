import { Injectable, UnauthorizedException, type CanActivate, type ExecutionContext } from '@nestjs/common';
import type { Request }                                                               from 'express';
import { AuthService }                                                                from './auth.service.js';


export type AuthRequest = Request & { user: { id: number; name: string } };


@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly auth: AuthService) {}
  async canActivate(ctx: ExecutionContext) {
    const req = ctx.switchToHttp().getRequest<AuthRequest>();
    const [scheme, token] = req.headers.authorization?.split(' ') ?? [];

    if (scheme !== 'Bearer' || !token) throw new UnauthorizedException('로그인이 필요합니다.');

    req.user = await this.auth.authenticate(token);

    return true;
  }
}
