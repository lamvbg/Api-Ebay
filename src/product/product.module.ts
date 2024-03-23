import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EbayController } from './product.controller';
import { EbayService } from './product.service';
import { EbayAuthService } from './utils/ebay-auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from './entities';
import { GoogleTranslateService } from './translation.service';
import { CategoryService } from '../Category/category.service';
import { Category } from 'src/Category/entities';

@Module({
  imports: [TypeOrmModule.forFeature([ProductEntity, Category]), ConfigModule.forRoot()],
  controllers: [EbayController],
  providers: [EbayService, EbayAuthService, GoogleTranslateService, CategoryService],
})
export class EbayModule {}
