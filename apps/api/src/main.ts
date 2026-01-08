import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS
  app.enableCors({
    origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));

  const port = process.env.PORT || 3001;
  await app.listen(port);
  
  console.log(`🚀 AI_xandria API running on http://localhost:${port}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🤖 AI Provider: ${process.env.AI_PROVIDER}`);
}

bootstrap();
