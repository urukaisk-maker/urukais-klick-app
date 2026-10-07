import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  // Seguridad
  app.use(helmet());
  app.use(cookieParser());

  // CORS para el frontend (Vite)
  app.enableCors({
    origin: config.get('FRONTEND_URL') ?? 'http://localhost:5173',
    credentials: true,
  });

  // Prefijo global /api
  app.setGlobalPrefix('api');

  // Validación global de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Urukais Klick API')
    .setDescription('API de la agenda personal estilo anime 🎌')
    .setVersion('1.0')
    .addCookieAuth('access_token')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = config.get('PORT') ?? 3000;
  await app.listen(port);
  console.log(`\n🎌 Urukais Klick API corriendo en: http://localhost:${port}/api`);
  console.log(`📖 Swagger: http://localhost:${port}/api/docs\n`);
}

bootstrap();