import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EbayController } from './product.controller';
import { EbayService } from './product.service';
import { EbayAuthService } from './utils/ebay-auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from './entities';
import { GoogleTranslateService } from './translation.service';
import { CategoryService } from '../Category/category.service';
import { Category } from '../Category/entities';
import { SettingService } from '../setting/setting.service';
import { Setting } from '../setting/entities';
import { JwtModule } from '@nestjs/jwt';
import { MySchedulerService } from './utils/my-scheduler.service';
import { ScheduleModule } from '@nestjs/schedule';
import { CloudinaryService } from '../setting/utils/file.service';
import { MailService } from './sendmail.service';
import { CartEntity } from '../cart/entities';
import { OrderItemEntity } from 'src/order/entities/orderItem.entity';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([ProductEntity, Category, Setting, CartEntity, OrderItemEntity]), ConfigModule.forRoot(),
    JwtModule.register({
    secret: 'asiodasjoddjdoasddasoidjasiodasdjaiodd',
    signOptions: { expiresIn: '24h' },
  })],
  controllers: [EbayController],
  providers: [EbayService, EbayAuthService, GoogleTranslateService, CategoryService, SettingService, MySchedulerService, CloudinaryService, MailService],
})
export class EbayModule {}
