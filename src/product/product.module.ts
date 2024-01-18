// ebay/ebay.module.ts

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EbayController } from './product.controller';
import { EbayService } from './product.service';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [EbayController],
  providers: [EbayService],
})
export class EbayModule {}
