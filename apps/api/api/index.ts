import { NestFactory } from '@nestjs/core';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { TransformInterceptor } from '../src/common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';

let appRef: INestApplication | null = null;

async function bootstrap(): Promise<INestApplication> {
  if (appRef) return appRef;

  const app = await NestFactory.create(AppModule, { logger: ['log', 'error', 'warn'] });

  // Global pipes, filters, interceptors
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: false,
    transformOptions: { enableImplicitConversion: true },
  }));
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  // Basic CORS - Allow all Vercel domains
  app.enableCors({
    origin: (origin: string | undefined, cb: (err: Error | null, allow?: boolean) => void) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return cb(null, true);
      
      // Allow all vercel.app domains and localhost
      if (
        origin.includes('.vercel.app') || 
        origin.includes('localhost') ||
        origin.includes('127.0.0.1')
      ) {
        return cb(null, true);
      }
      
      // Check environment variable for additional origins
      const corsEnv = process.env.CORS_ORIGINS || process.env.CORS_ORIGIN || '';
      const allowed = corsEnv.split(',').map(s => s.trim()).filter(Boolean);
      if (allowed.includes(origin)) return cb(null, true);
      
      // Allow by default in production (temporary fix)
      return cb(null, true);
    },
    credentials: true,
    methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS','HEAD'],
    allowedHeaders: ['Content-Type','Authorization','Accept','X-Requested-With','X-Tenant-ID','Origin'],
    exposedHeaders: ['Content-Range','X-Content-Range','X-Total-Count'],
    maxAge: 86400,
  });

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('HMS SaaS API')
    .setDescription('Multi-tenant Hospital Management API')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();
  const doc = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/docs', app, doc);

  await app.init();
  appRef = app;
  return app;
}

// Vercel serverless handler
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const app = await bootstrap();
    
    // Convert Vercel request to Express-compatible format
    const expressApp = app.getHttpAdapter().getInstance();
    
    // Handle the request using Express
    return new Promise((resolve, reject) => {
      expressApp(req, res, (err: any) => {
        if (err) {
          console.error('[Express Handler Error]', err);
          reject(err);
        } else {
          resolve(undefined);
        }
      });
    });
  } catch (error: any) {
    console.error('[Vercel Handler Error]', error?.stack || error);
    if (!res.headersSent) {
      res.status(500).json({
        statusCode: 500,
        message: 'Internal server error',
        error: error?.message || 'Unknown error',
        timestamp: new Date().toISOString(),
        path: req.url,
      });
    }
  }
}
