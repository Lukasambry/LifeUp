/**
 * Application Entry Point
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from '@presentation/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global filters
  app.useGlobalFilters(new HttpExceptionFilter());

  // CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  // Global prefix
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3001;
  await app.listen(port);

  console.log(`🚀 Backend server running on http://localhost:${port}/api`);
}

bootstrap();
