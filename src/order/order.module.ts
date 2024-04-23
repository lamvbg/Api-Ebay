// order/order.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderEntity } from './entities';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { ProductEntity } from '../product/entities';
import { UserEntity } from '../user/entities';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from '../auth/utils/jwt.strategy';
import { AuthService } from '../auth/auth.service';
import { CloudinaryService } from '../setting/utils/file.service';
import { SettingService } from '../setting/setting.service';
import { Setting } from '../setting/entities';
import { EbayService } from '../product/product.service';
import { EbayAuthService } from '../product/utils/ebay-auth.service';
import { GoogleTranslateService } from '../product/translation.service';
import { CategoryService } from '../Category/category.service';
import { MySchedulerService } from '../product/utils/my-scheduler.service';
import { Category } from '../Category/entities';
import { OrderItemEntity } from './entities/orderItem.entity';
import { CartEntity } from '../cart/entities';
import { CartService } from '../cart/cart.service';
import { DiscountService } from '../discount/discount.service';
import { DiscountEntity } from '../discount/entities';
import { MailService } from '../product/sendmail.service';

@Module({
  imports: [TypeOrmModule.forFeature([OrderEntity, ProductEntity, UserEntity, Category, OrderItemEntity, CartEntity, Setting, DiscountEntity]),JwtModule.register({
    secret: 'asiodasjoddjdoasddasoidjasiodasdjaiodd',
    signOptions: { expiresIn: '24h' },
  })],
  controllers: [OrderController],
  providers: [OrderService, JwtStrategy, AuthService, CloudinaryService, SettingService, EbayService, EbayAuthService, GoogleTranslateService, CategoryService, MySchedulerService, CartService, DiscountService, MailService],
})
export class OrderModule {}
