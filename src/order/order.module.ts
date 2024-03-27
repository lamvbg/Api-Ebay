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

@Module({
  imports: [TypeOrmModule.forFeature([OrderEntity, ProductEntity, UserEntity]),JwtModule.register({
    secret: 'asiodasjoddjdoasddasoidjasiodasdjaiodd',
    signOptions: { expiresIn: '24h' },
  })],
  controllers: [OrderController],
  providers: [OrderService, JwtStrategy, AuthService],
})
export class OrderModule {}
