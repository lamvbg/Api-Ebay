import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SettingController } from './setting.controller';
import { SettingService } from './setting.service';
import { Setting } from './entities';
import { ProductEntity } from 'src/product/entities';
import { EbayService } from 'src/product/product.service';
import { EbayAuthService } from 'src/product/utils/ebay-auth.service';
import { GoogleTranslateService } from 'src/product/translation.service';
import { CategoryService } from 'src/Category/category.service';
import { Category } from 'src/Category/entities';
import { JwtModule } from '@nestjs/jwt';
import { CloudinaryService } from './utils/file.service';

@Module({
  imports: [TypeOrmModule.forFeature([Setting, ProductEntity, Category]),JwtModule.register({
    secret: 'asiodasjoddjdoasddasoidjasiodasdjaiodd',
    signOptions: { expiresIn: '24h' },
  })],
  controllers: [SettingController],
  providers: [SettingService, EbayService, EbayAuthService, GoogleTranslateService, CategoryService, CloudinaryService],
})
export class SettingModule {}
