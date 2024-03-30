// order/order.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderEntity } from './entities';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { ProductEntity } from 'src/product/entities';
import { UserEntity } from 'src/user/entities';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from 'src/auth/utils/jwt.strategy';
import { AuthService } from 'src/auth/auth.service';
import { CloudinaryService } from 'src/setting/utils/file.service';
import { SettingService } from 'src/setting/setting.service';
import { Setting } from 'src/setting/entities';
import { EbayService } from 'src/product/product.service';
import { EbayAuthService } from 'src/product/utils/ebay-auth.service';
import { GoogleTranslateService } from 'src/product/translation.service';
import { CategoryService } from 'src/Category/category.service';
import { MySchedulerService } from 'src/product/utils/my-scheduler.service';
import { Category } from 'src/Category/entities';

@Module({
  imports: [TypeOrmModule.forFeature([OrderEntity, ProductEntity, UserEntity, Setting, Category]),JwtModule.register({
    secret: 'asiodasjoddjdoasddasoidjasiodasdjaiodd',
    signOptions: { expiresIn: '24h' },
  })],
  controllers: [OrderController],
  providers: [OrderService, JwtStrategy, AuthService, CloudinaryService, SettingService, EbayService, EbayAuthService, GoogleTranslateService, CategoryService, MySchedulerService],
})
export class OrderModule {}
