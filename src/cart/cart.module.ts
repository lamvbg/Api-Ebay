import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { CartEntity } from './entities';
import { ProductEntity } from '../product/entities';
import { UserEntity } from '../user/entities';
import { JwtStrategy } from '../auth/utils/jwt.strategy';
import { AuthService } from '../auth/auth.service';
import { JwtModule } from '@nestjs/jwt';
import { CloudinaryService } from '../setting/utils/file.service';

@Module({
  imports: [TypeOrmModule.forFeature([CartEntity, ProductEntity, UserEntity]),JwtModule.register({
    secret: 'asiodasjoddjdoasddasoidjasiodasdjaiodd',
    signOptions: { expiresIn: '24h' },
  })],
  controllers: [CartController],
  providers: [CartService, JwtStrategy, AuthService, CloudinaryService],
})
export class CartModule {}
