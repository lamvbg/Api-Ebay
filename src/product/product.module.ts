// ebay/ebay.module.ts

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EbayController } from './product.controller';
import { EbayService } from './product.service';
import { EbayAuthService } from './utils/ebay-auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from './entities';

@Module({
  imports: [TypeOrmModule.forFeature([ProductEntity]),ConfigModule.forRoot()],
  controllers: [EbayController],
  providers: [EbayService, EbayAuthService],
})
export class EbayModule {}
