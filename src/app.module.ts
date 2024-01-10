import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ProductModule } from './product/product.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm'
import { DatabaseModule } from './config/database.module';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    AuthModule,
    UserModule,
    ProductModule,
    DatabaseModule,
    PassportModule.register({ session: true }),
  ],
})
export class AppModule {}
