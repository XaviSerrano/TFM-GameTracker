import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Logger } from '@nestjs/common';
import * as dotenv from 'dotenv';

async function bootstrap() {
  // 1. Cargar variables de entorno ANTES de crear la app
  dotenv.config();
  
  const logger = new Logger('Bootstrap');

  // 2. Verificar variables críticas (solo en desarrollo)
  if (process.env.NODE_ENV !== 'production') {
    logger.log('=== Configuración del Entorno ===');
    logger.log(`NODE_ENV: ${process.env.NODE_ENV}`);
    logger.log(`PORT: ${process.env.PORT || 3000}`);
    logger.log(`CLOUDINARY_CLOUD_NAME: ${process.env.CLOUDINARY_CLOUD_NAME || 'NO CONFIGURADO'}`);
    logger.log(`CLOUDINARY_API_KEY: ${process.env.CLOUDINARY_API_KEY ? '***' + process.env.CLOUDINARY_API_KEY.slice(-4) : 'NO CONFIGURADO'}`);
    logger.log(`DATABASE_URL: ${process.env.DATABASE_URL ? 'CONFIGURADO' : 'NO CONFIGURADO'}`);
    logger.log('==================================');
  }

  // 3. Crear la aplicación
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // 4. Servir carpeta uploads (si la usas)
  app.useStaticAssets(join(__dirname, '..', 'uploads'), { 
    prefix: '/uploads',
    fallthrough: true,
    index: false,
  });

  // 5. Configurar CORS más permisivo para desarrollo
  app.enableCors({
    origin: (origin, callback) => {
      // Permite todas las solicitudes en desarrollo
      if (process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }
      
      // En producción, solo origines específicos
      if (!origin) {
        return callback(null, true);
      }

      const allowedOrigins = [
        'http://localhost:4200',
        'http://localhost:3000',
        /\.vercel\.app$/,
        /\.onrender\.com$/,
        'https://tu-app-frontend.vercel.app',
      ];

      const isAllowed = allowedOrigins.some(pattern => {
        if (pattern instanceof RegExp) {
          return pattern.test(origin);
        }
        return origin === pattern;
      });

      if (isAllowed) {
        return callback(null, true);
      }

      logger.warn(`CORS bloqueado: ${origin}`);
      return callback(new Error(`CORS blocked: ${origin}`), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
  });

  // 6. Obtener puerto y levantar servidor
  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');

  // 7. Logs informativos
  logger.log(`🚀 Backend ejecutándose en: ${await app.getUrl()}`);
  logger.log(`📁 Uploads servidos en: /uploads`);
  logger.log(`🌐 Entorno: ${process.env.NODE_ENV || 'development'}`);
  
  // 8. Verificar ConfigService
  const configService = app.get(ConfigService);
  const jwtSecret = configService.get<string>('JWT_SECRET');
  logger.log(`🔐 JWT_SECRET: ${jwtSecret ? 'CONFIGURADO' : 'NO CONFIGURADO'}`);
  
  // 9. Verificar Cloudinary (especialmente importante)
  const cloudinaryCloud = configService.get<string>('CLOUDINARY_CLOUD_NAME');
  logger.log(`☁️  Cloudinary: ${cloudinaryCloud || 'NO CONFIGURADO - Las imágenes fallarán'}`);
  
  if (!cloudinaryCloud) {
    logger.error('❌ ATENCIÓN: CLOUDINARY_CLOUD_NAME no está configurado');
    logger.warn('⚠️  Las subidas de imágenes fallarán');
  }
}

bootstrap();