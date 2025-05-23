// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// import { ExpressAdapter } from '@nestjs/platform-express';
// import * as express from 'express';
// import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  // const server = express();
  const app = await NestFactory.create(AppModule);
  
  // Cấu hình CORS
  app.enableCors();

  app.setGlobalPrefix('api');

  // const config = new DocumentBuilder()
  // .setTitle('Ebay API')
  // .setDescription('Ebay API description')
  // .setVersion('1.0')
  // .build();

  // const document = SwaggerModule.createDocument(app, config);
  // SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT || 2001);
}
bootstrap();
