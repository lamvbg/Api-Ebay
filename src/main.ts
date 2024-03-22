// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';
import * as passport from 'passport';

async function bootstrap() {
  const server = express();
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));
  
  // Cấu hình CORS
  app.enableCors({
    origin: ['http://localhost:5173', 'https://ebayorder.netlify.app', 'https://ebay-store.onrender.com'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept',
    credentials: true,
  });

  app.setGlobalPrefix('api');
  app.use(passport.initialize());

  await app.listen(2001);
}
bootstrap();
