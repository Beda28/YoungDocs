import 'reflect-metadata';
import { NestFactory }                          from '@nestjs/core';
import { AppModule }                            from './app.module.js';
import { ValidationPipe }                       from '@nestjs/common';
import type { NestExpressApplication }          from '@nestjs/platform-express';
import type { Request, Response, NextFunction } from 'express';
import cookieParser                             from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.set('trust proxy', 1);
  app.use(cookieParser());
  app.use('/api/auth', (_req: Request, res: Response, next: NextFunction) => { res.setHeader('Cache-Control', 'no-store'); next(); });
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }));
  app.enableShutdownHooks();
  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}

await bootstrap();
