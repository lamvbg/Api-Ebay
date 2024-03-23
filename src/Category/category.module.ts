import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entities';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { GoogleTranslateService } from '../product/translation.service'; // Điều chỉnh đường dẫn import

@Module({
  imports: [TypeOrmModule.forFeature([Category])],
  controllers: [CategoryController],
  providers: [CategoryService, GoogleTranslateService],
})
export class CategoryModule {}
