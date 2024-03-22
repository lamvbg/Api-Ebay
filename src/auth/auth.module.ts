import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/user/entities';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { GoogleStrategy } from './utils/google.strategy';
import { FacebookStrategy } from './utils/facebook.strategy';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]),
  JwtModule.register({
    secret: 'your-secret-key',
    signOptions: { expiresIn: '1h' },
  }),],
  controllers: [AuthController],
  providers: [
    GoogleStrategy,
    FacebookStrategy,
    AuthService
  ],
})
export class AuthModule {}
