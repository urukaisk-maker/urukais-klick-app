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

  // Confiar en el proxy (para IP real detrás de nginx)
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.set('trust proxy', 1);

  // 🛡️ Helmet: cabeceras de seguridad
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

  // Limitar tamaño de body (protección DoS)
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // CORS
  app.enableCors({
    origin: config.get('FRONTEND_URL') ?? 'http://localhost',
    credentials: true,
  });

  // Prefijo global
  app.setGlobalPrefix('api');

  // Validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = config.get('PORT') ?? 3000;
  const isProd = process.env.NODE_ENV === 'production';

  // 📖 Swagger (solo en desarrollo — oculto en producción)
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

  await app.listen(port);

  console.log(
    `\n🎌 Urukais Klick API corriendo en: http://localhost:${port}/api`,
  );

  if (!isProd) {
    console.log(`📖 Swagger: http://localhost:${port}/api/docs\n`);
  } else {
    console.log(`🔒 Swagger deshabilitado en producción\n`);
  }
}

bootstrap();