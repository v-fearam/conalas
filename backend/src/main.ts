import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import type { Request, Response } from 'express';
import express from 'express';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') ?? ['http://localhost:5173'],
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: false,
  });

  app.use(helmet());
  app.use(express.json({ limit: '5mb' }));

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Vercel serverless: init without listening, return the Express instance
  if (process.env.VERCEL) {
    await app.init();
    return app.getHttpAdapter().getInstance() as express.Application;
  } else {
    await app.listen(process.env.PORT ?? 3000);
  }
}

let handler: express.Application | undefined;

export default async (req: Request, res: Response) => {
  if (!handler) {
    handler = await bootstrap();
  }
  return handler!(req, res);
};

if (!process.env.VERCEL) {
  bootstrap();
}

