import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { CartEntity } from './entities';
import { ProductEntity } from 'src/product/entities';
import { UserEntity } from 'src/user/entities';
import { JwtStrategy } from 'src/auth/utils/jwt.strategy';
import { AuthService } from 'src/auth/auth.service';
import { JwtModule } from '@nestjs/jwt';
import { CloudinaryService } from 'src/setting/utils/file.service';

@Module({
  imports: [TypeOrmModule.forFeature([CartEntity, ProductEntity, UserEntity]),JwtModule.register({
    secret: 'asiodasjoddjdoasddasoidjasiodasdjaiodd',
    signOptions: { expiresIn: '24h' },
  })],
  controllers: [CartController],
  providers: [CartService, JwtStrategy, AuthService, CloudinaryService],
})
export class CartModule {}
