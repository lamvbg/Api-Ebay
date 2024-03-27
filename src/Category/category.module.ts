import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entities';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { GoogleTranslateService } from '../product/translation.service'; // Điều chỉnh đường dẫn import
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([Category]),JwtModule.register({
    secret: 'asiodasjoddjdoasddasoidjasiodasdjaiodd',
    signOptions: { expiresIn: '24h' },
  })],
  controllers: [CategoryController],
  providers: [CategoryService, GoogleTranslateService],
})
export class CategoryModule {}
