import { Module }          from '@nestjs/common';
import { JwtModule }       from '@nestjs/jwt';
import { TypeOrmModule }   from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthController }  from './auth.controller.js';
import { AuthService }     from './auth.service.js';
import { AuthGuard }       from './auth.guard.js';
import { OriginGuard }     from './origin.guard.js';
import { SessionService }  from './session.service.js';
import { User }            from './user.entity.js';


@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 60 }]),
    JwtModule.registerAsync({
      useFactory: () => {
        const secret = process.env.JWT_SECRET;
        if (!secret || secret.length < 32) throw new Error('JWT_SECRET must contain at least 32 characters');
        return {
          secret,
          signOptions:   { algorithm: 'HS256', expiresIn: 600, issuer: 'youngdocs', audience: 'youngdocs' },
          verifyOptions: { algorithms: ['HS256'], issuer: 'youngdocs', audience: 'youngdocs' },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers:   [AuthService, AuthGuard, OriginGuard, SessionService],
  exports:     [AuthGuard, AuthService],
})
export class AuthModule {}
