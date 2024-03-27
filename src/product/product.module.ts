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
import { SettingService } from 'src/setting/setting.service';
import { Setting } from 'src/setting/entities';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([ProductEntity, Category, Setting]), ConfigModule.forRoot(),JwtModule.register({
    secret: 'asiodasjoddjdoasddasoidjasiodasdjaiodd',
    signOptions: { expiresIn: '24h' },
  })],
  controllers: [EbayController],
  providers: [EbayService, EbayAuthService, GoogleTranslateService, CategoryService, SettingService],
})
export class EbayModule {}
