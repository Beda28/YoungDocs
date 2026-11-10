import { ForbiddenException, Injectable, type CanActivate, type ExecutionContext } from '@nestjs/common';
import type { Request }                                                            from 'express';


@Injectable()
export class OriginGuard implements CanActivate {
  canActivate(ctx: ExecutionContext) {
    const req    = ctx.switchToHttp().getRequest<Request>();
    const origin = process.env.APP_ORIGIN ?? 'http://localhost';

    if (req.method === 'GET') return true;
    if (req.headers['x-requested-with'] !== 'XMLHttpRequest' || (req.headers.origin && req.headers.origin !== origin)) {
      throw new ForbiddenException('허용되지 않은 요청입니다.');
    }

    return true;
  }
}
