import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SettingController } from './setting.controller';
import { SettingService } from './setting.service';
import { Setting } from './entities';
import { ProductEntity } from '../product/entities';
import { EbayService } from '../product/product.service';
import { EbayAuthService } from '../product/utils/ebay-auth.service';
import { GoogleTranslateService } from '../product/translation.service';
import { CategoryService } from '../Category/category.service';
import { Category } from '../Category/entities';
import { JwtModule } from '@nestjs/jwt';
import { CloudinaryService } from './utils/file.service';
import { MailService } from '../product/sendmail.service';
import { CartEntity } from '../cart/entities';
import { OrderItemEntity } from 'src/order/entities/orderItem.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Setting, ProductEntity, Category, CartEntity, OrderItemEntity]),JwtModule.register({
    secret: 'asiodasjoddjdoasddasoidjasiodasdjaiodd',
    signOptions: { expiresIn: '24h' },
  })],
  controllers: [SettingController],
  providers: [SettingService, EbayService, EbayAuthService, GoogleTranslateService, CategoryService, CloudinaryService, MailService],
})
export class SettingModule {}
