import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { EbayModule } from './product/product.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm'
import { DatabaseModule } from './config/database.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { OrderModule } from './order/order.module';
import { CategoryModule } from './Category/category.module';
import { SettingModule } from './setting/setting.module';
// import { AuthMiddleware } from './auth/authMiddleWare';

@Module({
  imports: [
    AuthModule,
    UserModule,
    EbayModule,
    DatabaseModule,
    OrderModule,
    CategoryModule,
    SettingModule,
    JwtModule.register({
      secret: 'your-secret-key',
      signOptions: { expiresIn: '24h' },
    })
  ],
})
export class AppModule {
  // configure(consumer: MiddlewareConsumer) {
  //   consumer.apply(AuthMiddleware).forRoutes('*');
  // }
}
