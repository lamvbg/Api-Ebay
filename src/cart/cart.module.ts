import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { CartEntity } from './entities';
import { ProductEntity } from 'src/product/entities';
import { UserEntity } from 'src/user/entities';

@Module({
  imports: [TypeOrmModule.forFeature([CartEntity, ProductEntity, UserEntity])],
  controllers: [CartController],
  providers: [CartService],
})
export class CartModule {}
