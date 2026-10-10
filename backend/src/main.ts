import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import * as express from 'express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.set('trust proxy', 1);

  // 🛡️ Helmet
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
      noSniff: true,
      frameguard: { action: 'deny' },
      referrerPolicy: { policy: 'no-referrer' },
    }),
  );

  app.use(cookieParser());
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // 🌐 CORS (acepta localhost + dominio del frontend en producción)
  const allowedOrigins = [
  'http://localhost',
  'http://localhost:5173',
  'http://localhost:4173',
  process.env.FRONTEND_URL,
  ...(process.env.CORS_ORIGINS?.split(',') ?? []),
].filter(Boolean) as string[];

  // CORS flexible para túneles y producción
app.enableCors({
  origin: (origin, callback) => {
    if (
      !origin ||
      origin.includes('localhost') ||
      origin.includes('trycloudflare.com') ||
      origin.includes('vercel.app') ||
      origin.includes('onrender.com')
    ) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
});
  
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Railway inyecta PORT automáticamente
  const port = process.env.PORT ?? config.get('PORT') ?? 3000;
  const isProd = process.env.NODE_ENV === 'production';

  // Swagger solo en desarrollo
  if (!isProd) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Urukais Klick API')
      .setDescription('API de la agenda personal estilo anime 🎌')
      .setVersion('1.0')
      .addCookieAuth('access_token')
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document);
  }

  await app.listen(port, '0.0.0.0');

  console.log(
    `\n🎌 Urukais Klick API corriendo en: http://localhost:${port}/api`,
  );

  if (!isProd) {
    console.log(`📖 Swagger: http://localhost:${port}/api/docs\n`);
  } else {
    console.log(`🔒 Producción · Swagger deshabilitado\n`);
  }
}

bootstrap();
