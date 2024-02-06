import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as session from 'express-session';
import * as passport from 'passport';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';
import * as cookieParser from 'cookie-parser';

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
  app.use(
    session({
      secret: 'asiodasjoddjdoasddasoidjasiodasdjaiodd',
      saveUninitialized: false,
      resave: false,
      cookie: {
        maxAge: 60000, // Đặt thời gian sống cho cookie
        httpOnly: true, // Tăng cường bảo mật bằng cách hạn chế truy cập từ JavaScript trên trang
        secure: process.env.NODE_ENV === 'production', // Sử dụng HTTPS cho cookies trong production
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // Cấu hình SameSite cho cookies
      },
    }),
  );
  app.use(cookieParser()); // Sử dụng cookie-parser để parse cookies
  app.use(passport.initialize());
  app.use(passport.session());
  await app.listen(2001);
}
bootstrap();
