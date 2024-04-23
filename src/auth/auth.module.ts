import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../user/entities';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { GoogleStrategy } from './utils/google.strategy';
import { FacebookStrategy } from './utils/facebook.strategy';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './utils/jwt.strategy';
import { JAuthGuard } from './utils/authMiddleWare';
import { CloudinaryService } from '../setting/utils/file.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]),
  JwtModule.register({
    secret: 'asiodasjoddjdoasddasoidjasiodasdjaiodd',
    signOptions: { expiresIn: '24h' },
  }),],
  controllers: [AuthController],
  providers: [
    GoogleStrategy,
    FacebookStrategy,
    AuthService,
    JwtStrategy,
    JAuthGuard,
    CloudinaryService
  ],
})
export class AuthModule {}
