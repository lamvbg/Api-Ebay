// order/order.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderEntity } from './entities';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { ProductEntity } from 'src/product/entities';
import { UserEntity } from 'src/user/entities';

@Module({
  imports: [TypeOrmModule.forFeature([OrderEntity, ProductEntity, UserEntity])],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
