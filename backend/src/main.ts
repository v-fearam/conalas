import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') ?? ['http://localhost:5173'],
    methods: ['GET', 'POST', 'OPTIONS'],
    credentials: false,
  });

  app.use(helmet());

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  if (process.env.VERCEL) {
    await app.init();
    return app.getHttpAdapter().getInstance();
  } else {
    await app.listen(process.env.PORT ?? 3000);
  }
}

let handler: any;

export default async (req: any, res: any) => {
  if (!handler) {
    handler = await bootstrap();
  }
  return handler(req, res);
};

if (!process.env.VERCEL) {
  bootstrap();
}

