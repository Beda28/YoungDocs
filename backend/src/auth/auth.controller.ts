import { Body, Controller, Get, HttpCode, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Throttle, ThrottlerGuard }                                   from '@nestjs/throttler';
import type { CookieOptions, Request, Response }                      from 'express';
import { AuthService }                                                from './auth.service.js';
import { AuthDto }                                                    from './auth.dto.js';
import { AuthGuard, type AuthRequest }                                from './auth.guard.js';
import { OriginGuard }                                                from './origin.guard.js';


@Controller('api/auth')
@UseGuards(OriginGuard, ThrottlerGuard)
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  private readonly cookie: CookieOptions = {
    httpOnly: true,
    secure:   process.env.COOKIE_SECURE === 'true',
    sameSite: 'strict',
    path:     '/api/auth',
  };

  private send(res: Response, data: { access: string; user: object; refresh: string; ttl: number }) {
    res.cookie('refresh', data.refresh, { ...this.cookie, maxAge: data.ttl });

    return { access: data.access, user: data.user };
  }
  @Post('signup')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async signup(@Body() data: AuthDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.send(res, await this.auth.signup(data, req.cookies?.refresh));
  }
  @Post('login')
  @HttpCode(200)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async login(@Body() data: AuthDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.send(res, await this.auth.login(data, req.cookies?.refresh));
  }
  @Post('refresh')
  @HttpCode(200)
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.send(res, await this.auth.refresh(req.cookies?.refresh));
  }
  @Post('logout')
  @HttpCode(204)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    await this.auth.logout(req.cookies?.refresh);
    res.clearCookie('refresh', this.cookie);
  }
  @Get('me')
  @UseGuards(AuthGuard)
  me(@Req() req: AuthRequest) { return req.user; }
}
